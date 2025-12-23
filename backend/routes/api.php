<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OrderController;
use App\Http\Middleware\RoleMiddleware;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// =====================
// 🔓 RUTAS PÚBLICAS
// =====================
Route::post('/login', [AuthController::class, 'login']);

// =====================
// 🔒 USUARIOS
// Solo Admin (1) y Gerente (2)
// =====================
Route::middleware(['auth:sanctum', RoleMiddleware::class . ':1,2'])->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
});

// =====================
// 🔒 ÓRDENES
// Admin (1), Gerente (2), Ventas (3)
// =====================
Route::middleware(['auth:sanctum', RoleMiddleware::class . ':1,2,3'])->group(function () {
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::get('/orders-next-number', [OrderController::class, 'nextNumber']);
    Route::put('/orders/{order}', [OrderController::class, 'update']);
    Route::delete('/orders/{order}', [OrderController::class, 'destroy']);
});
