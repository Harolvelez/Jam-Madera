<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\User;


class Order extends Model
{
    protected $table = 'orders';
    public $timestamps = false; // 👈 CLAVE

    protected $fillable = [
        'order_number',
        'client_id',
        'delivery_date',
        'status_id',
        'created_by'
    ];
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function status()
    {
        return $this->belongsTo(OrderStatus::class, 'status_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function statusHistory()
    {
        return $this->hasMany(OrderStatusHistory::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
