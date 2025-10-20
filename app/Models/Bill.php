<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
            'date_from' => 'timestamp',
            'date_to' => 'timestamp',
            'amount' => 'float',
            'created_at' => 'timestamp',
        ];
    }


    //////////////////
    ///Functions
    //////////////////

public static function createWithInitialState(array $attributes = [])
    {
        try {


            $startDate = $attributes['date'];
            // $startDate = Carbon::parse('2024-01-01');
            $today = Carbon::today();

            //Para sacar la fecha, chequear para ese cliente, la ultima factura.


            return DB::transaction(function () use ($attributes) {
                
               $all_movements = StockMovemen::whereBetween('created_at', [$startDate, $today->endOfDay()])
                ->where(getNameTypeMovement(2))
                ->where('is_billed',false)
                ->get();

                 $bill = Bill::create([
                    'client_id' => $attributes['client_id'],
                    'date_from' => $attributes['client_id'],
                    'amount' => 0,
                ])

                    $total = 0;
               

                // For each movement, create a item billed and mark as billed the movement
                foreach ($all_movements as $item) {
                    $days = $startDate->diffInDays($today);
                    BillItem::create([
                        'bill_id' => $bill->id,
                        'days' => $startDate->diffInDays($today),
                        'stock_movement_id' => $item->id,
                    ]);

                    StockMovemen::create([
                        'product_id' => $item->product,
                        'type' => getNameTypeMovement(0),
                        'is_billed'=> false,
                        'qty' =>$item->qty,
                    ]);

                    $item->is_billed = true;
                    $item->save();
                }


             


            });
        } catch (Exception $e) {
            // Loguear el error o manejarlo como quieras
            \Log::error('Error al crear factura: ' . $e->getMessage());
            throw $e; // re-lanzamos el error
        }
    }

    //////////////////
    ///--- End Functions
    //////////////////


}


