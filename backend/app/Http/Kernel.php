<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    /**
     * Middleware globales — se ejecutan en TODAS las rutas web y API.
     */
    protected $middleware = [
        // Manejo del mantenimiento
        \Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance::class,

        // Validar tamaño máximo de petición
        \Illuminate\Foundation\Http\Middleware\ValidatePostSize::class,

        // Convertir strings vacíos en null
        \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,

        // CORS (si usas Laravel CORS integrado)
        \Illuminate\Http\Middleware\HandleCors::class,
    ];

    /**
     * Grupos de middleware.
     */
    protected $middlewareGroups = [
        'web' => [
            \App\Http\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,

            // Si quieres CSRF para web
            \Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,

            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \App\Http\Middleware\VerifyCsrfToken::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],

        'api' => [
            // Límite de peticiones por minuto
            \Illuminate\Routing\Middleware\ThrottleRequests::class . ':api',

            // Resolución automática de modelos en rutas
            \Illuminate\Routing\Middleware\SubstituteBindings::class,

            // MUY IMPORTANTE: Sanctum para API
            
        ],
    ];

    /**
     * Middleware individuales — usados en rutas.
     */
    /**
 * Alias de middleware (Laravel 10+)
 */
protected $middlewareAliases = [
    'auth' => \App\Http\Middleware\Authenticate::class,
    'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
    'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
    'can' => \Illuminate\Auth\Middleware\Authorize::class,
    'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
    'bindings' => \Illuminate\Routing\Middleware\SubstituteBindings::class,

    // 👇 ESTE ES EL IMPORTANTE
    'role' => \App\Http\Middleware\RoleMiddleware::class,
];

}
