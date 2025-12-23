<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    /**
     * Manejo de roles por ID
     * Ejemplo de uso:
     * middleware => role:1,2
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        // 🔒 No autenticado
        if (!$user) {
            return response()->json([
                'message' => 'No autenticado'
            ], 401);
        }

        // 🔐 Validar rol
        foreach ($roles as $role) {
            if ((int) $user->role_id === (int) $role) {
                return $next($request);
            }
        }

        // 🚫 No autorizado
        return response()->json([
            'message' => 'No tienes permiso para esta acción'
        ], 403);
    }
}
