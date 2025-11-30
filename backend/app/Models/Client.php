<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Client extends Model
{
    use HasFactory;

    protected $table = 'clients';

    protected $fillable = [
        'name',
        'phone'
    ];

    // tu tabla tiene solo created_at, no updated_at -> desactivamos timestamps (DB asigna created_at)
    public $timestamps = false;

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'client_id');
    }
}
