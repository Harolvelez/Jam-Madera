<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Models\User;

class AuthController extends Controller
{
    // LOGIN API
    public function login(Request $request)
    {
        Log::info('LOGIN: request recibido', $request->all());

        // ✅ VALIDACIÓN MANUAL (API FRIENDLY)
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            Log::warning('LOGIN: validación fallida', $validator->errors()->toArray());

            return response()->json([
                'message' => 'Datos inválidos',
                'errors' => $validator->errors(),
            ], 422);
        }

        $credentials = $validator->validated();

        // ✅ BUSCAR USUARIO
        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            Log::warning('LOGIN: credenciales incorrectas', [
                'email' => $credentials['email']
            ]);

            return response()->json([
                'message' => 'Credenciales incorrectas',
            ], 401);
        }

        // ✅ CREAR TOKEN
        $token = $user->createToken('api-token')->plainTextToken;

        Log::info('LOGIN: token generado', ['user_id' => $user->id]);

        return response()->json([
            'message' => 'Login exitoso',
            'token' => $token,
            'user' => [
                'id'      => $user->id,
                'name'    => $user->name,
                'email'   => $user->email,
                'role_id'=> $user->role_id,
                'role'    => $user->role->name ?? null,
            ],
        ], 200);
    }

    // LOGOUT
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente'
        ]);
    }

    // LOGOUT TODAS LAS SESIONES
    public function logoutAll(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Todas las sesiones cerradas'
        ]);
    }
}
