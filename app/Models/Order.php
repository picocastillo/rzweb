<?php

namespace App\Models;

use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
        'assigned_to',
        'last_state',
        'address',
        'code',
        'date_from',
        'date_to',
        'is_active',
    ];

    protected $appends = ['name_client', 'name_last_state', 'name_assigned_to'];

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

    // //Relationships////
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function states()
    {
        return $this->hasMany(OrderState::class);
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }

    public function files()
    {
        return $this->hasMany(File::class);
    }

    public function itemOrders()
    {
        return $this->hasMany(ItemOrder::class);
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
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

    // //Functions/////
    public static function createWithInitialState(array $attributes = [])
    {
        try {
            return DB::transaction(function () use ($attributes) {

                $assignedTo = $attributes['assigned_to'] ?? null;
                $hasWorker = $assignedTo !== null && $assignedTo !== '';

                $order = self::create([
                    'last_state' => $hasWorker ? 1 : 0,
                    'address' => $attributes['address'],
                    'user_id' => $attributes['user_id'],
                    'code' => $attributes['code'],
                    'date_from' => $attributes['date_from'],
                    'date_to' => $attributes['date_to'],
                    'client_id' => $attributes['client_id'],
                    'is_active' => true,
                    'assigned_to' => $hasWorker ? $assignedTo : null,
                ]);

                OrderState::create([
                    'name' => 0,
                    'order_id' => $order->id,
                ]);

                if ($hasWorker) {
                    OrderState::create([
                        'name' => 1,
                        'order_id' => $order->id,
                    ]);
                }

                if (! empty($attributes['items'])) {
                    foreach ($attributes['items'] as $value) {

                        $stock = StockMovement::create([
                            'product_id' => $value['product_id'],
                            'qty' => $value['qty'],
                            'type' => 2, // Salida por orden
                        ]);

                        if (! empty($attributes['date_from'])) {
                            $at = Carbon::parse($attributes['date_from'], config('app.timezone'))
                                ->setTimeFromTimeString(now()->format('H:i:s'));
                            $stock->forceFill([
                                'created_at' => $at,
                                'updated_at' => $at,
                            ])->save();
                        }

                        ItemOrder::create([
                            'product_id' => $value['product_id'],
                            'qty' => $value['qty'],
                            'order_id' => $order->id,
                            'stock_movement_id' => $stock->id,
                        ]);
                    }
                }

                return $order;
            });
        } catch (Exception $e) {
            // Loguear el error o manejarlo como quieras
            Log::error('Error al crear orden: '.$e->getMessage());
            throw $e; // re-lanzamos el error
        }
    }

    /**
     * @return array{stock: StockMovement, warning: ?string}
     */
    public static function addMovementStock(array $attributes = [])
    {
        try {
            $stockWarning = null;

            // Validaciones de negocio antes de crear el movimiento
            if (isset($attributes['type']) && isset($attributes['order_id'])) {
                $order = Order::with('itemOrders')->findOrFail($attributes['order_id']);
                $itemOrder = $order->itemOrders->firstWhere('product_id', $attributes['product_id']);
                $product = Product::findOrFail($attributes['product_id']);

                if ($attributes['type'] == 2) {
                    // SALIDA — si no hay stock suficiente, permitir el movimiento y solo advertir
                    if ($product->current_stock < $attributes['qty']) {
                        $stockWarning = 'No hay suficiente stock para esta salida; el movimiento se registró igualmente.';
                        Log::warning('Salida de stock con disponibilidad insuficiente', [
                            'order_id' => $attributes['order_id'],
                            'product_id' => $attributes['product_id'],
                            'qty' => $attributes['qty'],
                            'current_stock' => $product->current_stock,
                        ]);
                    }
                } elseif ($attributes['type'] == 0) {
                    // ENTRADA — verificar que el producto exista en la orden
                    if (! $itemOrder) {
                        throw new Exception('El producto no existe en la orden para esta entrada.');
                    }
                }
            }

            $stock = DB::transaction(function () use ($attributes) {
                // Crear el movimiento de stock
                $stock = StockMovement::create([
                    'product_id' => $attributes['product_id'],
                    'qty' => $attributes['qty'],
                    'type' => $attributes['type'] ?? 0, // por defecto entrada
                ]);

                if (! empty($attributes['movement_date'])) {
                    $at = Carbon::parse($attributes['movement_date'], config('app.timezone'))
                        ->setTimeFromTimeString(now()->format('H:i:s'));
                    $stock->forceFill([
                        'created_at' => $at,
                        'updated_at' => $at,
                    ])->save();
                }

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

            return ['stock' => $stock, 'warning' => $stockWarning];
        } catch (Exception $e) {
            Log::error('Error al crear movimiento de stock: '.$e->getMessage());
            throw $e; // el controlador puede capturarla
        }
    }

    public function getNameClientAttribute()
    {
        return $this->client_id ? $this->client->name : '-';
    }

    public function getNameAssignedToAttribute()
    {
        return $this->assignedTo?->name ?? null;
    }

    public function getNameLastStateAttribute()
    {
        $lastState = $this->states()
            ->orderBy('id', 'desc')
            ->first();

        return $lastState ? getNameStateOrder($lastState->name) : 'Pendiente';
    }

    public function assignTo($userId)
    {
        $this->assigned_to = $userId;
        $this->last_state = 1;
        $this->save();

        $this->states()->create([
            'name' => 1,
            'order_id' => $this->id,
        ]);
    }
}
