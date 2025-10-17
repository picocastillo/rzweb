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

    ////Functions/////
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
