<?php

namespace App\Models;

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


    ////Functions////
    public function getCurrentStockAttribute()
    {
        return $this->stockMovements()->sum('qty');
    }    
}
