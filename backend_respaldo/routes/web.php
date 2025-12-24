<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

Route::get('/db-check', function () {
    try {
        DB::connection()->getPdo();
        return 'DB OK (web)';
    } catch (\Exception $e) {
        return 'DB ERROR (web): ' . $e->getMessage();
    }
});