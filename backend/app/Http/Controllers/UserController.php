<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // ✅ Listar usuarios
    public function index()
    {
        return User::select('id','name','email','role_id','created_at')
            ->orderBy('id','desc')
            ->get();
    }

    // ✅ Crear usuario
   public function store(Request $request)
{
    $data = $request->validate([
        'name' => ['required','string','max:255'],
        'email' => ['required','email','max:255','unique:users,email'],
        'password' => ['required','string','min:4'],
        'role_id' => ['required','integer'],
    ]);

    // 🔒 BLOQUEAR ADMIN
    if ($data['role_id'] == 1) {
        return response()->json([
            'message' => 'No se puede asignar rol Admin'
        ], 403);
    }

    $user = User::create([
        'name' => $data['name'],
        'email' => $data['email'],
        'password' => Hash::make($data['password']),
        'role_id' => $data['role_id'],
    ]);

    return response()->json([
        'message' => 'Usuario creado',
        'user' => $user
    ], 201);
}


    // ✅ Actualizar usuario (password opcional)
    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'email' => ['required','email','max:255',"unique:users,email,{$user->id}"],
            'password' => ['nullable','string','min:4'],
            'role_id' => ['required','integer'],
        ]);

        $user->name = $data['name'];
        $user->email = $data['email'];
        $user->role_id = $data['role_id'];

        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        return response()->json(['message' => 'Usuario actualizado', 'user' => $user]);
    }

    // ✅ Eliminar usuario
    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(['message' => 'Usuario eliminado']);
    }
}
