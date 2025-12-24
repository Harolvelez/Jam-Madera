<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrderStatus extends Model
{
    use HasFactory;

    protected $table = 'order_status';

    protected $fillable = [
        'name'
    ];

    // sin timestamps
    public $timestamps = false;

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'status_id');
    }

    public function history(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class, 'status_id');
    }
}