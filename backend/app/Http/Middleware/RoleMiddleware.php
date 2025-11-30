<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        // roles pueden ser: [1, 2, 'ventas', 'producción']
        foreach ($roles as $role) {
            if (is_numeric($role) && $user->role_id == $role) {
                return $next($request);
            }

            if (!is_numeric($role) && $user->role && $user->role->name == $role) {
                return $next($request);
            }
        }

        return response()->json(['message' => 'No tienes permiso para esta acción'], 403);
    }
}
