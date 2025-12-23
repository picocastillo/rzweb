<?php

namespace App\Models;

use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

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

    // // Relationships ////
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
                ->whereHas('itemOrders', fn ($q) => $q->whereIn('order_id', $attributes['orders']))
                ->get();

            if ($movements->isEmpty()) {
                throw new Exception('No hay movimientos pendientes para facturar');
            }

            $bill = Bill::create([
                'client_id' => $attributes['client_id'],
                'date_from' => self::getStartDateForOrder($attributes['client_id'], $attributes),
                'amount' => 0,
            ]);

            $total = $movements->sum(function ($movement) use ($bill) {

                $itemOrder = $movement->itemOrders->first();
                $orderId = $itemOrder->order_id;
                $productId = $movement->product_id;
                $order = $itemOrder->order;

                // Buscamos si la orden tiene movimiento de salida (Devolucion) posterior a este movimiento de entrada
                $hasOutput = StockMovement::where('type', 0)
                    ->where('product_id', $productId)
                    ->where('created_at', '>', $movement->created_at)
                    ->whereHas('itemOrders', fn ($q) => $q->where('order_id', $orderId))
                    ->first();

                $startDate = self::getStartDateForOrder($orderId);
                $endDate = Carbon::now()->startOfDay();

                // Caso 1: tuvo salida
                if ($hasOutput) {
                    $endDate = $hasOutput->created_at->startOfDay();
                    $order->update(['is_active' => 0]);
                }

                $days = $startDate->diffInDays($endDate);

                BillItem::create([
                    'bill_id' => $bill->id,
                    'days' => $days,
                    'stock_movement_id' => $movement->id,
                ]);

                $movement->update(['is_billed' => true]);

                // Caso 2: sigue en la orden, generamos residual
                if (! $hasOutput) {
                    $newMovement = StockMovement::create([
                        'product_id' => $movement->product_id,
                        'qty' => $movement->qty,
                        'type' => 2,
                        'is_billed' => false,
                        'created_at' => now()->endOfDay(),
                    ]);

                    ItemOrder::create([
                        'order_id' => $orderId,
                        'product_id' => $movement->product_id,
                        'qty' => $movement->qty,
                        'stock_movement_id' => $newMovement->id,
                    ]);
                }

                return $movement->qty * $days * ($movement->product->current_cost ?? 0);
            });

            $bill->update(['amount' => $total]);

            return $bill;
        });
    }

    private static function getStartDateForOrder(int $orderId)
    {
        // 1. Ultima factura de ESTA orden
        $lastBill = Bill::whereHas('billItems.stockMovement.itemOrders', function ($q) use ($orderId) {
            $q->where('order_id', $orderId);
        })
            ->latest('created_at')
            ->first();

        if ($lastBill) {
            return Carbon::parse($lastBill->created_at)->startOfDay();
        }

        // 2. Si nunca se facturo tomamos el primer movimiento de la orden
        $firstMovement = StockMovement::where('type', 2)
            ->whereHas('itemOrders', fn ($q) => $q->where('order_id', $orderId))
            ->oldest('created_at')
            ->first();

        return Carbon::parse($firstMovement->created_at)->startOfDay();
    }
}
