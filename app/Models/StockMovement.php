<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'product_id',
        'type',
        'is_billed',
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

        return max(1, $start->diffInDays($end));
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

        return max(1, $overlapStart->diffInDays($overlapEnd));
    }
}
