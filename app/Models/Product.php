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

    protected $appends = ['current_cost'];

    ////Relationships////
    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function costs()
    {
        return $this->hasMany(Cost::class)->orderBy('created_at', 'desc');
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
        // Primero intenta desde la relación ya cargada (eager loading)
        if ($this->relationLoaded('costs') && $this->costs->isNotEmpty()) {
            return (float) $this->costs->first()->price;
        }
        
        // Si no está cargada, hace la consulta
        return $this->costs()->latest()->value('price');
    }

}
