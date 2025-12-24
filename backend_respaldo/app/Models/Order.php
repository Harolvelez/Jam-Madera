<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $table = 'orders';

    // ✅ IMPORTANTE: tu tabla sí tiene created_at/updated_at
    public $timestamps = true;

    protected $fillable = [
        'order_number',
        'nit',
        'client_name',
        'phone',
        'email',
        'ingreso_type',
        'creation_date',
        'estimated_delivery_date',
        'simple_status',
        'status_id',
        'created_by',
        'client_id',
        'delivery_date',
        'description',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }
}