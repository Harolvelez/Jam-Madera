<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrderController;

Route::get('/orders', [OrderController::class, 'index']);
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/{id}', [OrderController::class, 'show']);
Route::get('/orders-next-number', [OrderController::class, 'nextNumber']);
Route::delete('/orders/{order}', [OrderController::class, 'destroy']);
Route::put('/orders/{order}', [OrderController::class, 'update']);

