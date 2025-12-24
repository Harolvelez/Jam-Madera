<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    // LISTAR CLIENTES
    public function index()
    {
        return Client::orderBy('id', 'desc')->get();
    }

    // CREAR CLIENTE NUEVO
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'  => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'notes' => 'nullable|string',
        ]);

        $client = Client::create($data);

        return response()->json([
            'message' => 'Cliente creado correctamente',
            'client'  => $client,
        ], 201);
    }
}