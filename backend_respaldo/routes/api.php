<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\StatusController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\api\OrderBoardController;
use App\Http\Controllers\AuditController;
use App\Http\Controllers\OrderCalendarController;



Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1');

Route::get('/users/simple', function () {
    return \App\Models\User::select('id', 'name')
        ->orderBy('name')
        ->get();
    })->middleware('auth:sanctum');

Route::get('/orders/search', function (\Illuminate\Http\Request $request) {
    return \App\Models\Order::query()
        ->when($request->q, fn ($q) =>
            $q->where('code', 'like', "%{$request->q}%")
        )
        ->limit(10)
        ->get(['id', 'order_number']);
    })->middleware('auth:sanctum');


Route::middleware('auth:sanctum')->group(function () {
    // Tablero tipo Trello
    Route::get('/orders/board', [OrderController::class, 'board']);
    Route::get('/audit/order-status', [AuditController::class, 'index']);

    // Órdenes
    Route::get('/orders', [OrderController::class, 'index']);

    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/calendar', [OrderCalendarController::class, 'index']);

    // Clientes
    Route::get('/clients', [ClientController::class, 'index']);
    Route::post('/clients', [ClientController::class, 'store']);

    // Estados
    Route::get('/statuses', [StatusController::class, 'index']);

    // Notificaciones
    Route::get('/notifications', [NotificationController::class, 'index']);

    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);

    // Mover orden entre columnas
    Route::patch('/orders/{order}/move', [OrderBoardController::class, 'move']);
    
    Route::put('/orders/{id}', [OrderController::class, 'update']);
    Route::delete('/orders/{id}', [OrderController::class, 'destroy']);
    Route::post('/orders/{id}/status', [OrderController::class, 'updateStatus']);
});
