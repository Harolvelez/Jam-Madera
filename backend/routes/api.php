<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\StatusController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Api\OrderBoardController;
use App\Http\Controllers\AuditController;
use App\Http\Controllers\OrderCalendarController;
use App\Http\Middleware\RoleMiddleware;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// =====================
// 🔓 RUTAS PÚBLICAS
// =====================
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1'); // Añadido del primer archivo (protección contra fuerza bruta)

// =====================
// 🔒 RUTAS AUTENTICADAS
// =====================
Route::middleware('auth:sanctum')->group(function () {
    // 🔍 Búsquedas rápidas (del primer archivo)
    Route::get('/users/simple', function () {
        return \App\Models\User::select('id', 'name')
            ->orderBy('name')
            ->get();
    });
    
    Route::get('/orders/search', function (\Illuminate\Http\Request $request) {
        return \App\Models\Order::query()
            ->when($request->q, fn ($q) =>
                $q->where('code', 'like', "%{$request->q}%")
            )
            ->limit(10)
            ->get(['id', 'order_number']);
    });
    
    // 🔐 GESTIÓN DE USUARIOS (del segundo archivo)
    // Solo Admin (1) y Gerente (2)
    Route::middleware([RoleMiddleware::class . ':1,2'])->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
    });
    
    // =====================
    // 📋 ÓRDENES DE TRABAJO
    // =====================
    
    // 📊 Tablero tipo Trello (del primer archivo)
    Route::get('/orders/board', [OrderController::class, 'board']);
    
    // 📅 Calendario de órdenes (del primer archivo)
    Route::get('/orders/calendar', [OrderCalendarController::class, 'index']);
    
    // 🔄 Mover orden entre columnas (del primer archivo)
    Route::patch('/orders/{order}/move', [OrderBoardController::class, 'move']);
    
    // 🏷️ Actualizar estado de orden (del primer archivo)
    Route::post('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    
    // 📝 CRUD de órdenes (combinado de ambos archivos)
    // Admin (1), Gerente (2), Ventas (3) - del segundo archivo
    Route::middleware([RoleMiddleware::class . ':1,2,3'])->group(function () {
        Route::get('/orders', [OrderController::class, 'index']);
        Route::post('/orders', [OrderController::class, 'store']);
        Route::get('/orders/{id}', [OrderController::class, 'show']);
        Route::get('/orders-next-number', [OrderController::class, 'nextNumber']); // del segundo archivo
        Route::put('/orders/{order}', [OrderController::class, 'update']);
        Route::delete('/orders/{order}', [OrderController::class, 'destroy']);
    });
    
    // 👥 CLIENTES (del primer archivo)
    Route::get('/clients', [ClientController::class, 'index']);
    Route::post('/clients', [ClientController::class, 'store']);
    
    // 🏷️ ESTADOS (del primer archivo)
    Route::get('/statuses', [StatusController::class, 'index']);
    
    // 🔔 NOTIFICACIONES (del primer archivo)
    Route::get('/notifications', [NotificationController::class, 'index']);
    
    // 📊 AUDITORÍA (del primer archivo)
    Route::get('/audit/order-status', [AuditController::class, 'index']);
    
    // 🔐 LOGOUT (combinado - ambas versiones son similares)
    Route::post('/logout', [AuthController::class, 'logout']);
});