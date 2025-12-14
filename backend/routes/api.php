<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\StatusController;
use App\Http\Controllers\NotificationController;

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1');

Route::middleware('auth:sanctum')->group(function () {
    // Tablero tipo Trello
    Route::get('/orders/board', [OrderController::class, 'board']);
    
    // Órdenes
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::put('/orders/{id}', [OrderController::class, 'update']);
    Route::delete('/orders/{id}', [OrderController::class, 'destroy']);
    Route::post('/orders/{id}/status', [OrderController::class, 'updateStatus']);

    // Mover orden entre columnas
    Route::patch('/orders/{order}/move', [OrderBoardController::class, 'move']);

    // Clientes
    Route::get('/clients', [ClientController::class, 'index']);
    Route::post('/clients', [ClientController::class, 'store']);

    // Estados
    Route::get('/statuses', [StatusController::class, 'index']);

    // Notificaciones
    Route::get('/notifications', [NotificationController::class, 'index']);

    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);
});
