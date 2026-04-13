<?php

namespace App\Models;

use Carbon\Carbon;
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
        'date_to',
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
            'date_to' => 'datetime:Y-m-d H:i:s',
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

            if (empty($attributes['date_from'] ?? null) || empty($attributes['date_to'] ?? null)) {
                throw new \Exception('Debe indicar el período de facturación (desde y hasta).');
            }

            return DB::transaction(function () use ($attributes) {
                $periodFrom = Carbon::parse($attributes['date_from'])->startOfDay();
                $periodTo = Carbon::parse($attributes['date_to'])->startOfDay();

                if ($periodFrom->gt($periodTo)) {
                    throw new \Exception('La fecha hasta debe ser posterior o igual a la fecha desde.');
                }

                $movements = StockMovement::where('type', 2)
                    ->where('is_billed', false)
                    ->whereHas('itemOrders', fn ($q) => $q->whereIn('order_id', $attributes['orders']))
                    ->with(['itemOrders.order', 'product'])
                    ->get();

                if ($movements->isEmpty()) {
                    throw new \Exception('No hay movimientos pendientes para facturar');
                }

                $billableLines = [];
                foreach ($movements as $movement) {
                    $itemOrder = $movement->itemOrders->first();
                    if (! $itemOrder) {
                        continue;
                    }
                    $orderId = $itemOrder->order_id;
                    $days = $movement->rentalDaysInPeriod($orderId, $periodFrom, $periodTo);
                    if ($days > 0) {
                        $billableLines[] = [
                            'movement' => $movement,
                            'days' => $days,
                            'order_id' => $orderId,
                        ];
                    }
                }

                if (empty($billableLines)) {
                    throw new \Exception('Ningún alquiler pendiente tiene días en el período seleccionado.');
                }

                $bill = Bill::create([
                    'client_id' => $attributes['client_id'],
                    'date_from' => $periodFrom,
                    'date_to' => $periodTo,
                    'amount' => 0,
                ]);

                $total = 0;

                foreach ($billableLines as $line) {
                    $movement = $line['movement'];
                    $days = $line['days'];
                    $orderId = $line['order_id'];
                    $itemOrder = $movement->itemOrders->first();
                    $order = $itemOrder->order;

                    $regreso = StockMovement::firstRegresoAfterSalida($movement, $orderId);

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

                    $total += $movement->qty * $days * ($movement->product->current_cost ?? 0);
                }

                $bill->update(['amount' => $total]);

                return $bill;
            });

        } catch (\Exception $e) {
            \Log::error('Error billing orders: '.$e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'attributes' => $attributes,
            ]);

            throw new \Exception("Error en la facturación (Línea {$e->getLine()}): ".$e->getMessage());
        }
    }
}
