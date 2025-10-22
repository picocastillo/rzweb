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
            'date_from' => 'timestamp',
            'amount' => 'float',
            'created_at' => 'timestamp',
        ];
    }

    // ////////////////
    // /Functions
    // ////////////////

    public static function createWithInitialState(array $attributes = [])
    {
        try {

            // Para sacar la fecha, chequear para ese cliente, la ultima factura.

            return DB::transaction(function () use ($attributes) {
                $lastBill = Bill::where('client_id', $attributes['client_id'])
                    ->latest('date_from')
                    ->first();

                $startDate = $lastBill ? $lastBill->date_from : $attributes['date'];
                // $startDate = Carbon::parse('2024-01-01');
                $today = Carbon::today();

                $all_movements = StockMovement::whereBetween('created_at', [$startDate, $today->endOfDay()])
                    ->where('type', getNameTypeMovement(2))
                    ->where('is_billed', false)
                    ->get();

                $bill = Bill::create([
                    'client_id' => $attributes['client_id'],
                    'date_from' => $startDate,
                    'amount' => 0,
                ]);

                // For each movement, create a item billed and mark as billed the movement
                $totalAmount = 0;
                foreach ($all_movements as $item) {
                    $lastBillItem = BillItem::where('stock_movement_id', $item->id)
                        ->latest('created_at')
                        ->first();

                    if ($lastBillItem) {
                        $startDateForItem = $lastBillItem->bill->date_from;
                    } else {
                        $startDateForItem = $item->created_at;
                    }

                    $days = $startDateForItem->diffInDays($today);
                    // $subtotal = $item->qty * $days;
                    BillItem::create([
                        'bill_id' => $bill->id,
                        'days' => $startDate->diffInDays($today),
                        'stock_movement_id' => $item->id,
                    ]);

                    StockMovement::create([
                        'product_id' => $item->product,
                        'type' => getNameTypeMovement(0),
                        'is_billed' => false,
                        'qty' => $item->qty,
                    ]);

                    //calculamos el amount en base a los dias y el costo actual del producto
                    $productCost = $item->product->current_cost ?? 0;
                    $subtotal = $item->qty * $days * $productCost;
                    $totalAmount += $subtotal;

                    $item->is_billed = true;
                    $item->save();
                }
                $bill->update(['amount' => $totalAmount]);
            });
        } catch (Exception $e) {
            // Loguear el error o manejarlo como quieras
            \Log::error('Error al crear factura: '.$e->getMessage());
            throw $e; // re-lanzamos el error
        }
    }

    // ////////////////
    // /--- End Functions
    // ////////////////

}
