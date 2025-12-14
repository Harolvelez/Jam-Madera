<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrderStatus extends Model
{
    protected $table = 'order_status';
    
    public $timestamps = false;

    protected $fillable = ['name'];

    public function orders()
    {
        return $this->hasMany(Order::class, 'status_id');
    }
}

