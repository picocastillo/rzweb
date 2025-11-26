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
        try {

            return DB::transaction(function () use ($attributes) {
                $clientId = $attributes['client_id'];
                $selectedOrderIds = $attributes['orders'] ?? [];

                if (empty($selectedOrderIds)) {
                    throw new Exception('Debe seleccionar al menos una orden para facturar');
                }

                // Para sacar la fecha, chequear para ese cliente, la ultima factura.
                $lastBill = Bill::where('client_id', $clientId)
                    ->latest('date_from')
                    ->first();

                $today = Carbon::today();

                // Si NO hay factura anterior, usamos la fecha de hoy
                $startDate = $lastBill
                ? Carbon::parse($lastBill->created_at)
                : Carbon::parse($attributes['date'] ?? $today);

                // Consulta base para movimientos
                $movementsQuery = StockMovement::where('type', 0)
                    ->where('is_billed', false)
                    ->whereHas('itemOrders', function($query) use ($selectedOrderIds) {
                        $query->whereIn('order_id', $selectedOrderIds);
                    });

                // Aplicar filtro de fecha según si existe factura anterior
                if ($lastBill) {
                    $all_movements = $movementsQuery
                        ->whereBetween('created_at', [$startDate, $today->endOfDay()])
                        ->get();
                } else {
                    $all_movements = $movementsQuery
                        ->where('created_at', '<=', $today->endOfDay())
                        ->get();
                }

                if ($all_movements->isEmpty()) {
                    throw new Exception('No hay movimientos pendientes para facturar para este cliente');
                }

                $bill = Bill::create([
                    'client_id' => $attributes['client_id'],
                    'date_from' => $startDate,
                    'amount' => 0,
                ]);

                // For each movement, create a item billed and mark as billed the movement
                $totalAmount = 0;
                foreach ($all_movements as $item) {
                    // La orden asociada al movimiento
                    $order = $item->itemOrders->first()->order;

                    // Fecha inicial del alquiler = la fecha de la orden
                    $orderStart = Carbon::parse($order->date_from)->startOfDay();

                    // Fecha del movimiento (salida parcial o total)
                    $movementDate = Carbon::parse($item->created_at)->startOfDay();

                    // Calcular días entre la fecha de la orden y la salida
                    $days = $orderStart->diffInDays($movementDate);

                    BillItem::create([
                        'bill_id' => $bill->id,
                        'days' => $days,
                        'stock_movement_id' => $item->id,
                    ]);

                    //calculamos el amount en base a los dias y el costo actual del producto
                    $productCost = $item->product->current_cost ?? 0;
                    $subtotal = $item->qty * $days * $productCost;
                    $totalAmount += $subtotal;

                    $item->is_billed = true;
                    $item->save();
                }
                $bill->update(['amount' => $totalAmount]);

                return $bill;
            });
        } catch (Exception $e) {
            // Loguear el error o manejarlo como quieras
            \Log::error('Error al crear factura: '.$e->getMessage());
            throw $e; // re-lanzamos el error
        }
    }

}
