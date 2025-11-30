<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

use App\Models\User;

class AuthController extends Controller
{
    // LOGIN AVANZADO
    public function login(Request $request)
    {
        Log::info('LOGIN: entrando al método', ['data' => $request->all()]);

        Log::info('LOGIN: antes de validar');

        $credentials = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'password' => ['required', 'string', 'min:4'],
        ]);

        Log::info('LOGIN: después de validar, antes de buscar usuario');

        $user = User::where('email', $credentials['email'])->first();

        Log::info('LOGIN: después de buscar usuario', ['user_id' => $user?->id]);

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            Log::info('LOGIN: credenciales incorrectas');
            throw ValidationException::withMessages([
                'email' => ['Credenciales incorrectas.'],
            ]);
        }

        Log::info('LOGIN: credenciales correctas, creando token');

        $token = $user->createToken('api-token')->plainTextToken;

        Log::info('LOGIN: token creado OK');

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