<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $table = 'order_items';

    // ✅ CLAVE: tu tabla order_items no tiene timestamps
    public $timestamps = false;

    protected $fillable = [
        'order_id',
        'description',
        'quantity',
        'width',
        'height',
        'length',
    ];
}
