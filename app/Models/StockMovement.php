<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'product_id',
        'type',
        'is_billed',
        'qty',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_billable' => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    ////Relationships////
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function itemOrders()
    {
        return $this->hasMany(ItemOrder::class);
    }

}
