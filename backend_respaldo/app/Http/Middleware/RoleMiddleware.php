<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RoleMiddleware
{
    /**
     * Middleware para verificar roles de usuario
     * 
     * USO:
     * - Por ID:        ->middleware('role:1,2')
     * - Por nombre:    ->middleware('role:admin,manager')
     * - Mixto:         ->middleware('role:1,admin,2,manager')
     * 
     * @param Request $request
     * @param Closure $next
     * @param string ...$roles Lista de roles permitidos (IDs o nombres)
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        // 🔒 Usuario no autenticado
        if (!$user) {
            Log::warning('RoleMiddleware: Usuario no autenticado', [
                'ip' => $request->ip(),
                'path' => $request->path()
            ]);
            
            return response()->json([
                'message' => 'No autenticado',
                'error' => 'UNAUTHENTICATED'
            ], 401);
        }

        Log::debug('RoleMiddleware: Validando roles', [
            'user_id' => $user->id,
            'user_role_id' => $user->role_id,
            'required_roles' => $roles
        ]);

        // 🔐 Validar cada rol permitido
        foreach ($roles as $role) {
            // Validación por ID numérico
            if (is_numeric($role) && (int)$user->role_id === (int)$role) {
                Log::info('RoleMiddleware: Acceso permitido por ID', [
                    'user_id' => $user->id,
                    'role_id' => $user->role_id,
                    'required_role' => $role
                ]);
                return $next($request);
            }

            // Validación por nombre de rol (con verificación segura)
            if (!is_numeric($role) && $user->role && $user->role->name === $role) {
                Log::info('RoleMiddleware: Acceso permitido por nombre', [
                    'user_id' => $user->id,
                    'role_name' => $user->role->name,
                    'required_role' => $role
                ]);
                return $next($request);
            }
        }

        // 🚫 Usuario no tiene ningún rol permitido
        Log::warning('RoleMiddleware: Acceso denegado', [
            'user_id' => $user->id,
            'user_role_id' => $user->role_id,
            'user_role_name' => $user->role->name ?? 'null',
            'required_roles' => $roles,
            'path' => $request->path(),
            'method' => $request->method()
        ]);

        return response()->json([
            'message' => 'No tienes permiso para esta acción',
            'error' => 'FORBIDDEN',
            'required_roles' => $roles,
            'current_role' => [
                'id' => $user->role_id,
                'name' => $user->role->name ?? null
            ]
        ], 403);
    }
}