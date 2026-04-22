<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cost extends Model
{
    protected $fillable = [
        'product_id',
        'price',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'float',
            'product_id' => 'integer',
        ];
    }

    // //Relationships////
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
