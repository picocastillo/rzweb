<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    protected $fillable = ['message', 'check', 'user_id', 'is_private', 'order_id'];


    public function order()
    {
        return $this->belognsTo(Order::class);
    }
}


