<?php

namespace App\Models;

use DB;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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

    protected $appends = ['name_client', 'name_last_state'];

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

    ////Relationships////
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function states()
    {
        return $this->hasMany(OrderState::class);
    }

    public function itemOrders()
    {
        return $this->hasMany(ItemOrder::class);
    }

    public function stockMovements()
    {
        return $this->hasManyThrough(
            StockMovement::class,  // Modelo final
            ItemOrder::class,      // Modelo intermedio
            'order_id',            // Clave foránea en ItemOrder
            'id',                  // Clave foránea en StockMovement
            'id',                  // Clave local en Order
            'stock_movement_id'    // Clave local en ItemOrder
        );
    }

    ////Functions/////
    public static function createWithInitialState(array $attributes = [])
    {
        try {
            return DB::transaction(function () use ($attributes) {
                
                $order = self::create([
                    'last_state' => 0, 
                    'address' => $attributes['address'],
                    'user_id' => $attributes['user_id'],
                    'code' => $attributes['code'],
                    'date_from' => $attributes['date_from'],
                    'date_to' => $attributes['date_to'],
                    'client_id' =>$attributes['client_id'],
                    'is_active' => true,
                ]);


                OrderState::create([
                    'name' => 0,
                    'order_id' => $order->id
                ]);

                foreach ($attributes['items'] as $value) {
                    
                    $stock = StockMovement::create([
                        'product_id' => $value['product_id'],
                        'qty' => $value['qty'],
                        'type'=> 2, // Salida por orden
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

    public static function addMovementStock(array $attributes = [])
    {
        try {
            // Validaciones de negocio antes de crear el movimiento
            if (isset($attributes['type']) && isset($attributes['order_id'])) {
                $order = Order::with('itemOrders')->findOrFail($attributes['order_id']);
                $itemOrder = $order->itemOrders->firstWhere('product_id', $attributes['product_id']);

                if ($attributes['type'] == 2) {
                    // SALIDA — verificar si hay suficiente stock
                    if (!$itemOrder || $itemOrder->qty < $attributes['qty']) {
                        throw new Exception('No hay suficiente stock en la orden para esta salida.');
                    }
                } elseif ($attributes['type'] == 0) {
                    // ENTRADA — verificar que el producto exista en la orden
                    if (!$itemOrder) {
                        throw new Exception('El producto no existe en la orden para esta entrada.');
                    }
                }
            }

            return DB::transaction(function () use ($attributes) {
                // Crear el movimiento de stock
                $stock = StockMovement::create([
                    'product_id' => $attributes['product_id'],
                    'qty' => $attributes['qty'],
                    'type' => $attributes['type'] ?? 0, // por defecto entrada
                ]);

                // Registrar en ItemOrder si hay orden asociada
                if (isset($attributes['order_id'])) {
                    ItemOrder::create([
                        'product_id' => $attributes['product_id'],
                        'qty' => $attributes['qty'],
                        'order_id' => $attributes['order_id'],
                        'stock_movement_id' => $stock->id,
                    ]);
                }

                return $stock;
            });
        } catch (Exception $e) {
            \Log::error('Error al crear movimiento de stock: ' . $e->getMessage());
            throw $e; // el controlador puede capturarla
        }
    }

    public function getNameClientAttribute()
    {
        return $this->client_id ? $this->client->name : '-';
    }

    public function getNameLastStateAttribute()
    {
        if (! isset($this->last_state)) {
            return 'Desconocido';
        }

        if (function_exists('getNameStateOrder')) {
            try {
                return getNameStateOrder((int) $this->last_state) ?? 'Desconocido';
            } catch (\Throwable $e) {
                return 'Desconocido';
            }
        }

        return 'Desconocido';
    }

}
