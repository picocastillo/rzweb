<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use DB;

class Order extends Model
{
    
    
   

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'client_id',
        'last_state',
        'address',
        'code',
        'date_from',
        'date_to',
        'is_active',
    ];


    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

       public static function createWithInitialState(array $attributes = [])
    {
        try {
            return DB::transaction(function () use ($attributes) {
                
                $order = self::create([
                    'last_state' => getNameStateOrder(0), 
                    'address' => $attributes['address'],
                    'user_id' => $attributes['user_id'],
                    'code' => $attributes['code'],
                    'date_from' => $attributes['date_from'],
                    'date_to' => $attributes['date_to'],
                    'client_id' =>$attributes['client_id'],
                ]);


                OrderState::create([
                    'name' => getNameStateOrder(0),
                    'order_id' => $order->id
                ]);

                foreach ($attributes['items'] as $value) {
                    
                    $stock = StockMovement::create([
                        'product_id' => $value['product_id'],
                        'qty' => $value['qty'],
                        'type'=> getNameTypeMovement(2),
                        'is_billable'=> true,
                    ]);

                    ItemOrder::create([
                        'product_id' => $value['product_id'],
                        'qty' => $value['qty'],
                        'order_id' => $order->id,
                        'stock_movement_id' => $stock->id
                    ]);
                }

                return $order;
            });
        } catch (Exception $e) {
            // Loguear el error o manejarlo como quieras
            \Log::error('Error al crear orden: ' . $e->getMessage());
            throw $e; // re-lanzamos el error
        }
    }


}
