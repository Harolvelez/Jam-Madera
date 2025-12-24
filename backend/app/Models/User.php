<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // timestamps sí existen (created_at y updated_at en tu SQL)
    public $timestamps = true;

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function ordersCreated(): HasMany
    {
        return $this->hasMany(Order::class, 'created_by');
    }

    // helper rápido
    public function isRole($roleIdOrName)
    {
        if (is_numeric($roleIdOrName)) {
            return $this->role_id == $roleIdOrName;
        }
        return $this->role && $this->role->name === $roleIdOrName;
    }
}