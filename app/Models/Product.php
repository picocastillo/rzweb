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

    ////Relationships////
    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function costs()
    {
        return $this->hasMany(Cost::class);
    }

    ////Functions////
    public function getCurrentStockAttribute()
    {
        return $this->stockMovements()->sum('qty');
    }
    
    public function adjustStock(int $qty, int $type, bool $isBillable = true)
    {
        switch ($type) {
            case 0: // Regreso por orden
            case 1: // Alta stock
                $finalQty = $qty;
                break;
            case 2: // Salida por orden
                $finalQty = -$qty;
                break;
            default:
                throw new Exception('Tipo de movimiento inválido');
        }

        // Crear movimiento de stock
        $movement = $this->stockMovements()->create([
            'qty' => $finalQty,
            'type' => $type,
            'is_billable' => $isBillable,
        ]);

        // Actualizar stock actual del producto
        $this->increment('current_stock', $finalQty);

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
        return $this->costs()->latest()->value('price');
    }

}
