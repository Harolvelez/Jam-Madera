<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrderStatusHistory extends Model
{
    protected $table = 'order_status_history'; // 👈 CLAVE

    public $timestamps = false;

    protected $fillable = [
        'order_id',
        'status_id',
        'changed_by',
        'changed_at'
    ];

    protected $casts = [
        'changed_at' => 'datetime',
    ];
}

