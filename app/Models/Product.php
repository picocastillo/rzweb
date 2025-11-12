<?php

namespace App\Models;

use Exception;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
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
        ];
    }

    protected $appends = [
        'current_cost', 
        'current_stock',
        'stock_in_rental',
        'available_stock',
    ];

    ////Relationships////
    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function costs()
    {
        return $this->hasMany(Cost::class)->orderBy('created_at', 'desc');
    }

    public function itemOrders()
    {
        return $this->hasMany(ItemOrder::class);
    }

    ////Functions////
    // public function getCurrentStockAttribute()
    // {
    //     return $this->stockMovements()->sum('qty');
    // }
    
    public function adjustStock(int $qty, bool $isBillable = true)
    {
        $finalQty = $qty;

        // Crear movimiento de stock
        $movement = $this->stockMovements()->create([
            'qty' => $finalQty,
            'type' => 1,
            'is_billable' => $isBillable,
        ]);

        // Actualizar stock actual del producto
        //$this->increment('current_stock', $finalQty);

        return $movement;
    }

    public function addCostToProduct(float $price): Cost
    {
        return $this->costs()->create([
            'price' => $price,
        ]);
    }

    public function getCurrentCostAttribute(): ?float
    {
        if ($this->relationLoaded('costs') && $this->costs->isNotEmpty()) {
            return (float) $this->costs->first()->price;
        }
        
        // Si no esta cargada, hago la consulta
        return $this->costs()->latest()->value('price');
    }

    /**
     * Stock total del producto (suma de TODOS los movimientos)
     * Tipo 1 = Entrada (+)
     * Tipo 2 = Salida (-)
     * Tipo 0 = Ajuste por facturación (+)
     */
    public function getCurrentStockAttribute()
    {
        return $this->stockMovements()
            ->selectRaw('
                SUM(CASE 
                    WHEN type = 1 THEN qty 
                    WHEN type = 2 THEN -qty 
                    WHEN type = 0 THEN qty 
                    ELSE 0 
                END) as total
            ')
            ->value('total') ?? 0;
    }

    /**
     * Stock actualmente en alquiler (aún no facturado)
     * Son los movimientos tipo 2 (salida) que tienen is_billed = false
     */
    public function getStockInRentalAttribute()
    {
        return $this->stockMovements()
            ->where('type', 2)
            ->where('is_billed', false)
            ->sum('qty');
    }

    /**
     * Stock disponible para nuevas órdenes
     * = Stock total + Stock en alquiler (porque el stock en alquiler ya fue restado)
     */
    public function getAvailableStockAttribute()
    {
        
        $totalEntries = $this->stockMovements()
            ->whereIn('type', [1, 0]) // Entradas y ajustes
            ->sum('qty');
            
        $billedExits = $this->stockMovements()
            ->where('type', 2)
            ->where('is_billed', true)
            ->sum('qty');
            
        return $totalEntries - $billedExits;
    }

    public function getStockWithoutItemOrdersAttribute()
    {
        return $this->available_stock;
    }

}
