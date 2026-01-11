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
| Todas las rutas aquí quedan bajo /api
| Ej: /api/login, /api/orders, /api/audit/order-status
*/

/* =========================================================
   🔓 RUTAS PÚBLICAS (SIN TOKEN)
========================================================= */
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1'); // protección contra fuerza bruta


/* =========================================================
   🔒 RUTAS AUTENTICADAS (CON TOKEN SANCTUM)
========================================================= */
Route::middleware('auth:sanctum')->group(function () {

    /* =========================================================
       🔍 BÚSQUEDAS RÁPIDAS
    ========================================================= */
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


    /* =========================================================
       👤 USUARIOS (Solo Admin 1 y Gerente 2)
    ========================================================= */
    Route::middleware([RoleMiddleware::class . ':1,2'])->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
    });


    /* =========================================================
       📋 ÓRDENES DE TRABAJO
    ========================================================= */

    // 📊 Tablero tipo Trello
    Route::get('/orders/board', [OrderController::class, 'board']);

    // 📅 Calendario de órdenes
    Route::get('/orders/calendar', [OrderCalendarController::class, 'index']);

    // 🔄 Mover orden entre columnas
    Route::patch('/orders/{order}/move', [OrderBoardController::class, 'move']);

    // 🏷️ Actualizar estado de orden (si usas este endpoint)
    Route::post('/orders/{id}/status', [OrderController::class, 'updateStatus']);


    // 📝 CRUD de órdenes (Admin 1, Gerente 2, Ventas 3)
    Route::middleware([RoleMiddleware::class . ':1,2,3'])->group(function () {
        Route::get('/orders', [OrderController::class, 'index']);
        Route::post('/orders', [OrderController::class, 'store']);
        Route::get('/orders/{id}', [OrderController::class, 'show']);
        Route::get('/orders-next-number', [OrderController::class, 'nextNumber']);
        Route::put('/orders/{order}', [OrderController::class, 'update']);
        Route::delete('/orders/{order}', [OrderController::class, 'destroy']);
    });


    /* =========================================================
       👥 CLIENTES
    ========================================================= */
    Route::get('/clients', [ClientController::class, 'index']);
    Route::post('/clients', [ClientController::class, 'store']);


    /* =========================================================
       🏷️ ESTADOS
    ========================================================= */
    Route::get('/statuses', [StatusController::class, 'index']);


    /* =========================================================
       🔔 NOTIFICACIONES
    ========================================================= */
    Route::get('/notifications', [NotificationController::class, 'index']);


    /* =========================================================
       📊 AUDITORÍA
    ========================================================= */

    // ✅ Ver auditoría (todos los usuarios autenticados pueden consultar)
    Route::get('/audit/order-status', [AuditController::class, 'index']);

    // ✅ Eliminar auditoría (SOLO Admin 1 y Gerente 2)
    // 📌 Se usa POST en vez de DELETE para evitar problemas de body en DELETE en algunos servidores (nginx/proxy)
    Route::middleware([RoleMiddleware::class . ':1,2'])->group(function () {
        Route::post('/audit/order-status-history/delete', [AuditController::class, 'destroyMany']);

        // (Opcional) si quieres también soportar DELETE:
        // Route::delete('/audit/order-status-history', [AuditController::class, 'destroyMany']);
    });


    /* =========================================================
       🔐 LOGOUT
    ========================================================= */
    Route::post('/logout', [AuthController::class, 'logout']);
});
