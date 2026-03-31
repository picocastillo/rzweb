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
    try {
        if (empty($attributes['orders'] ?? [])) {
            throw new \Exception('Debe seleccionar al menos una orden para facturar');
        }

        return DB::transaction(function () use ($attributes) {
            $movements = StockMovement::where('type', 2)
                ->where('is_billed', false)
                ->whereHas('itemOrders', fn ($q) => $q->whereIn('order_id', $attributes['orders']))
                ->get();

            if ($movements->isEmpty()) {
                throw new \Exception('No hay movimientos pendientes para facturar');
            }

            $earliestBillDate = null;
            foreach ($attributes['orders'] as $oid) {
                $start = self::getStartDateForOrder((int) $oid);
                if ($earliestBillDate === null || $start->lt($earliestBillDate)) {
                    $earliestBillDate = $start;
                }
            }

            $bill = Bill::create([
                'client_id' => $attributes['client_id'],
                'date_from' => $earliestBillDate,
                'amount' => 0,
            ]);

            $total = $movements->sum(function ($movement) use ($bill, $attributes) {
                $itemOrder = $movement->itemOrders->first();
                $orderId = $itemOrder->order_id;
                $order = $itemOrder->order;

                $regreso = StockMovement::firstRegresoAfterSalida($movement, $orderId);

                $days = $movement->rentalDaysBetweenSalidaAndRegreso($orderId);

                if ($regreso) {
                    $order->update(['is_active' => 0]);
                }

                BillItem::create([
                    'bill_id' => $bill->id,
                    'days' => $days,
                    'stock_movement_id' => $movement->id,
                ]);

                $movement->update(['is_billed' => true]);

                if (! $regreso) {
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

    } catch (\Exception $e) {
        // This logs the specific file and line number to storage/logs/laravel.log
        \Log::error("Error billing orders: " . $e->getMessage(), [
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'attributes' => $attributes
        ]);

        // Re-throw or return a custom error message to the UI
        throw new \Exception("Error en la facturación (Línea {$e->getLine()}): " . $e->getMessage());
    }
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

        // 2. Sin facturas previas: inicio del alquiler según la orden (date_from)
        $order = Order::find($orderId);
        if ($order && $order->date_from) {
            return Carbon::parse($order->date_from)->startOfDay();
        }

        // 3. Respaldo: primer movimiento de salida (tipo 2) de la orden
        $firstMovement = StockMovement::where('type', 2)
            ->whereHas('itemOrders', fn ($q) => $q->where('order_id', $orderId))
            ->oldest('created_at')
            ->first();

        if ($firstMovement) {
            return Carbon::parse($firstMovement->created_at)->startOfDay();
        }

        throw new Exception(
            "No se pudo determinar la fecha de inicio para la orden {$orderId}."
        );
    }
}
