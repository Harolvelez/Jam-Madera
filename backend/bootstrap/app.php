<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',      // 👈 AÑADIDO
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: 'api',                       // 👈 Prefijo /api para routes/api.php
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append(\Illuminate\Http\Middleware\HandleCors::Class);
    })

    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })
    ->create();
