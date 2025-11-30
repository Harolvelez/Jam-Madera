<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;

class AuthController extends Controller
{
    // LOGIN AVANZADO
    public function login(Request $request)
    {
        // Validación robusta
        $credentials = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'password' => ['required', 'string', 'min:4'],
        ], [
            'email.exists' => 'El correo no está registrado.',
        ]);

        // Buscar usuario
        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['La contraseña es incorrecta.'],
            ]);
        }

        // Eliminar tokens previos (solo si quieres evitar múltiples sesiones)
        $user->tokens()->delete();

        // Crear token Sanctum
        $token = $user->createToken('jam_token')->plainTextToken;

        // Actualizar última sesión
        $user->last_login_at = now();
        $user->save();

        return response()->json([
            'message' => 'Login exitoso',
            'user' => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role_id' => $user->role_id,
                'role' => $user->role->name ?? null,
            ],
            'token' => $token
        ]);
    }

    // LOGOUT
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sesión cerrada correctamente']);
    }

    // LOGOUT DE TODAS LAS SESIONES
    public function logoutAll(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Todas las sesiones cerradas']);
    }
}
