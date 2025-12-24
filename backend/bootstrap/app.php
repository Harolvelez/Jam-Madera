<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware): void {

        // ✅ CORS (necesario para Vite / React)
        $middleware->append(\Illuminate\Http\Middleware\HandleCors::class);

        // ✅ EVITAR REDIRECCIONES EN RUTAS API (CLAVE)
        $middleware->redirectGuestsTo(function ($request) {
            if ($request->is('api/*')) {
                // ❌ NO redirigir, devolver JSON
                return null;
            }

            // para rutas web normales
            return '/';
        });

    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })
    ->create();