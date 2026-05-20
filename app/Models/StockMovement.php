<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class StockMovement extends Model
{
    use HasFactory;

    /** @var Collection<int, self>|null */
    protected static ?Collection $activeSalidasCache = null;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'product_id',
        'type',
        'qty',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_billable' => 'boolean',
            'created_at' => 'datetime',
            'type' => 'integer',
            'qty' => 'integer',
            'product_id' => 'integer',
        ];
    }

    // //Relationships////
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function itemOrders()
    {
        return $this->hasMany(ItemOrder::class, 'stock_movement_id');
    }

    public function billItems()
    {
        return $this->hasMany(BillItem::class);
    }

    /**
     * Salidas (tipo 2) cuyo material sigue en la orden (sin regreso posterior).
     * Result is cached per request (2 queries total).
     *
     * @return Collection<int, self>
     */
    public static function activeSalidas(): Collection
    {
        if (static::$activeSalidasCache !== null) {
            return static::$activeSalidasCache;
        }

        $salidas = static::query()
            ->where('type', 2)
            ->with('itemOrders:id,order_id,stock_movement_id')
            ->get(['id', 'product_id', 'type', 'qty', 'created_at']);

        if ($salidas->isEmpty()) {
            return static::$activeSalidasCache = collect();
        }

        $orderIds = $salidas
            ->flatMap(fn (self $movement) => $movement->itemOrders->pluck('order_id'))
            ->unique()
            ->filter()
            ->values();

        $regresos = static::query()
            ->where('type', 0)
            ->whereHas('itemOrders', fn ($q) => $q->whereIn('order_id', $orderIds))
            ->with('itemOrders:id,order_id,stock_movement_id')
            ->get(['id', 'product_id', 'created_at']);

        static::$activeSalidasCache = $salidas->filter(function (self $salida) use ($regresos) {
            $orderId = $salida->itemOrders->first()?->order_id;

            if (! $orderId) {
                return false;
            }

            $hasRegreso = $regresos->contains(
                fn (self $regreso) => (int) $regreso->product_id === (int) $salida->product_id
                    && (int) $regreso->itemOrders->first()?->order_id === (int) $orderId
                    && $regreso->created_at > $salida->created_at,
            );

            return ! $hasRegreso;
        })->values();

        return static::$activeSalidasCache;
    }

    /**
     * Salida (tipo 2) cuyo material sigue en la orden (sin regreso posterior).
     */
    public function isActiveRental(): bool
    {
        if ((int) $this->type !== 2) {
            return false;
        }

        return static::activeSalidas()->contains('id', $this->id);
    }

    public function order()
    {
        return $this->hasOneThrough(
            Order::class,
            ItemOrder::class,
            'stock_movement_id',
            'id',
            'id',
            'order_id'
        );
    }

    /**
     * Primer movimiento "Regreso por orden" (tipo 0) posterior a esta salida,
     * misma orden y producto.
     */
    public static function firstRegresoAfterSalida(self $salida, int $orderId): ?self
    {
        return static::query()
            ->where('type', 0)
            ->where('product_id', $salida->product_id)
            ->where('created_at', '>', $salida->created_at)
            ->whereHas('itemOrders', fn ($q) => $q->where('order_id', $orderId))
            ->oldest('created_at')
            ->first();
    }

    /**
     * Cierra un alquiler activo (salida sin regreso) al facturar: registro de regreso (tipo 0)
     * y nueva salida (tipo 2) en la fecha actual, para continuar el alquiler en la orden.
     */
    public static function closeActiveRentalForBilling(self $salida, int $orderId): void
    {
        $at = Carbon::now(config('app.timezone'));

        $regreso = static::create([
            'product_id' => $salida->product_id,
            'qty' => $salida->qty,
            'type' => 0,
        ]);
        $regreso->forceFill([
            'created_at' => $at,
            'updated_at' => $at,
        ])->save();

        ItemOrder::create([
            'product_id' => $salida->product_id,
            'qty' => $salida->qty,
            'order_id' => $orderId,
            'stock_movement_id' => $regreso->id,
        ]);

        $newSalidaAt = $at->copy()->addSecond();

        $newSalida = static::create([
            'product_id' => $salida->product_id,
            'qty' => $salida->qty,
            'type' => 2,
        ]);
        $newSalida->forceFill([
            'created_at' => $newSalidaAt,
            'updated_at' => $newSalidaAt,
        ])->save();

        ItemOrder::create([
            'product_id' => $salida->product_id,
            'qty' => $salida->qty,
            'order_id' => $orderId,
            'stock_movement_id' => $newSalida->id,
        ]);

        static::$activeSalidasCache = null;
    }

    /**
     * Días entre esta salida (tipo 2) y el regreso (tipo 0) siguiente,
     * o hasta hoy si el material sigue en la orden.
     */
    public function rentalDaysBetweenSalidaAndRegreso(int $orderId): int
    {
        $start = Carbon::parse($this->created_at)->startOfDay();
        $regreso = static::firstRegresoAfterSalida($this, $orderId);
        $end = $regreso !== null
            ? Carbon::parse($regreso->created_at)->startOfDay()
            : Carbon::now()->startOfDay();

        return $start->diffInDays($end) + 1;
    }

    /**
     * Días de alquiler que caen dentro de [periodFrom, periodTo] (inclusive),
     * respecto de esta salida (tipo 2) y su regreso o la fecha actual.
     */
    public function rentalDaysInPeriod(int $orderId, Carbon $periodFrom, Carbon $periodTo): int
    {
        $start = Carbon::parse($this->created_at)->startOfDay();
        $regreso = static::firstRegresoAfterSalida($this, $orderId);
        $end = $regreso !== null
            ? Carbon::parse($regreso->created_at)->startOfDay()
            : Carbon::now()->startOfDay();

        $periodFrom = $periodFrom->copy()->startOfDay();
        $periodTo = $periodTo->copy()->startOfDay();

        if ($periodFrom->gt($periodTo)) {
            return 0;
        }

        $overlapStart = $start->greaterThan($periodFrom) ? $start : $periodFrom;
        $overlapEnd = $end->lessThan($periodTo) ? $end : $periodTo;

        if ($overlapStart->gt($overlapEnd)) {
            return 0;
        }

        return $overlapStart->diffInDays($overlapEnd) + 1;
    }
}
