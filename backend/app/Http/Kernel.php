<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    /**
     * Middleware globales — se ejecutan en TODAS las rutas web y API.
     */
    protected $middleware = [
        \Illuminate\Http\Middleware\HandleCors::class,
        \Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance::class,
        \Illuminate\Foundation\Http\Middleware\ValidatePostSize::class,
        \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
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
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ],
    ];

    /**
     * Middleware individuales — usados en rutas.
     */
    protected $routeMiddleware = [
        'auth' => \App\Http\Middleware\Authenticate::class,
        'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,

        // Redirige si ya hay sesión iniciada
        'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,

        // Autorización por roles personalizados
        'role' => \App\Http\Middleware\RoleMiddleware::class,

        // Autorización por permisos (si lo agregas luego)
        'can' => \Illuminate\Auth\Middleware\Authorize::class,

        // Firmar URLs
        'signed' => \Illuminate\Routing\Middleware\ValidateSignature::class,

        // Rate limiting personalizado
        'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,

        // CORS para rutas específicas
        'cors' => \Illuminate\Http\Middleware\HandleCors::class,

        // Substituir bindings
        'bindings' => \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ];
}
