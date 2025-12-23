<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Models\User;

class AuthController extends Controller
{
    // LOGIN API - VERSIÓN MEJORADA
    public function login(Request $request)
    {
        Log::info('LOGIN: Inicio de solicitud', $request->all());

        // ✅ VALIDACIÓN CON VALIDADOR (API FRIENDLY)
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email', 'exists:users,email'],
            'password' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            Log::warning('LOGIN: Validación fallida', $validator->errors()->toArray());

            return response()->json([
                'message' => 'Datos inválidos',
                'errors' => $validator->errors(),
            ], 422);
        }

        $credentials = $validator->validated();
        Log::info('LOGIN: Validación exitosa, buscando usuario');

        // ✅ BUSCAR Y VERIFICAR USUARIO
        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            Log::warning('LOGIN: Credenciales incorrectas', [
                'email' => $credentials['email']
            ]);

            return response()->json([
                'message' => 'Credenciales incorrectas',
            ], 401);
        }

        Log::info('LOGIN: Credenciales verificadas, generando token', ['user_id' => $user->id]);

        // ✅ CREAR TOKEN
        $token = $user->createToken('api-token')->plainTextToken;

        Log::info('LOGIN: Token generado exitosamente');

        // ✅ RESPUESTA EXITOSA (combinando lo mejor de ambos)
        return response()->json([
            'message' => 'Login exitoso',
            'token' => $token,
            'user' => [
                'id'      => $user->id,
                'name'    => $user->name,
                'email'   => $user->email,
                'role_id' => $user->role_id,
                'role'    => $user->role->name ?? null,
            ]
        ], 200);
    }

    // LOGOUT - Versión limpia
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        
        Log::info('LOGOUT: Sesión cerrada', ['user_id' => $request->user()->id]);
        
        return response()->json([
            'message' => 'Sesión cerrada correctamente'
        ]);
    }

    // LOGOUT TODAS LAS SESIONES - Versión limpia
    public function logoutAll(Request $request)
    {
        $user = $request->user();
        $user->tokens()->delete();
        
        Log::info('LOGOUT-ALL: Todas las sesiones cerradas', ['user_id' => $user->id]);
        
        return response()->json([
            'message' => 'Todas las sesiones cerradas'
        ]);
    }
}