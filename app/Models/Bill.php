<?php

namespace App\Models;

use Exception;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Bill extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'client_id',
        'date_from',
        'amount',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date_from' => 'datetime:Y-m-d H:i:s',
            'amount' => 'float',
            'created_at' => 'datetime:Y-m-d H:i:s',
        ];
    }

    //// Relationships ////
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function billItems()
    {
        return $this->hasMany(BillItem::class);
    }

    // ////////////////
    // /Functions
    // ////////////////
    public static function createWithInitialState(array $attributes = [])
    {
        if (empty($attributes['orders'] ?? [])) {
            throw new Exception('Debe seleccionar al menos una orden para facturar');
        }

        return DB::transaction(function () use ($attributes) {
            $movements = StockMovement::where('type', 2)
                ->where('is_billed', false)
                ->whereHas('itemOrders', fn($q) => $q->whereIn('order_id', $attributes['orders']))
                ->get();

            if ($movements->isEmpty()) {
                throw new Exception('No hay movimientos pendientes para facturar');
            }

            $bill = Bill::create([
                'client_id' => $attributes['client_id'],
                'date_from' => self::getStartDate($attributes['client_id'], $attributes),
                'amount'    => 0,
            ]);

            $total = $movements->sum(function ($movement) use ($bill) {

                $start = Carbon::parse($bill->date_from)->startOfDay();
                $end   = Carbon::today()->startOfDay(); 

                $days = $start->diffInDays($end);
                if ($days < 0) $days = 0;

                BillItem::create([
                    'bill_id'           => $bill->id,
                    'days'              => $days,
                    'stock_movement_id' => $movement->id,
                ]);

                $subtotal = $movement->qty * $days * ($movement->product->current_cost ?? 0);

                $movement->update(['is_billed' => true]);

                //aca devolvemos a la orden de nuevo (para facturar parcial)
                StockMovement::create([
                    'product_id'  => $movement->product_id,
                    'qty'         => $movement->qty,
                    'type'        => 2,
                ]);

                return $subtotal;
            });

            $bill->update(['amount' => $total]);

            return $bill;
        });
    }

    private static function getStartDate(int $clientId, array $attributes)
    {
        $lastBill = Bill::where('client_id', $clientId)
            ->latest('created_at')
            ->first();

        if ($lastBill) {
            return Carbon::parse($lastBill->created_at)->startOfDay();
        }

        // Si no hay factura, tomamos el primer movimiento
        $firstMovement = StockMovement::where('type', 2)
            ->whereHas('itemOrders', fn($q) => $q->whereIn('order_id', $attributes['orders']))
            ->oldest('created_at')
            ->first();

        return Carbon::parse($firstMovement->created_at)->startOfDay();
    }

}
