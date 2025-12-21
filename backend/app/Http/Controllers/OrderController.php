<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    // LISTAR (para las tarjeticas)
    public function index()
    {
        // Devuelve lo necesario para el listado
        return Order::select('id', 'order_number', 'client_name', 'nit',  'creation_date', 'estimated_delivery_date')
            ->orderBy('id', 'desc')
            ->get();
    }

    // VER DETALLE
    public function show($id)
    {
        return Order::with('items')->findOrFail($id);
    }

    // NEXT NUMBER
    public function nextNumber()
    {
        $last = Order::orderBy('id', 'desc')->first();
        $nextNumber = $last
            ? intval(preg_replace('/\D/', '', (string) $last->order_number)) + 1
            : 1;

        return response()->json([
            'next' => 'ORD-' . str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT),
        ]);
    }

    // CREAR ORDEN + ITEMS (SIN "BORRADOR")
    public function store(Request $request)
{
    $data = $request->validate([
        'order_number' => 'required|string|max:20|unique:orders,order_number',
        'nit' => 'nullable|string|max:50',
        'client_name' => 'required|string|max:255',
        'phone' => 'required|string|max:30',
        'email' => 'nullable|email|max:255',
        'ingreso_type' => 'required|in:interno,externo',
        'creation_date' => 'nullable|date',
        'estimated_delivery_date' => 'nullable|date',

        'items' => 'required|array|min:1',
        'items.*.description' => 'required|string|max:255',
        'items.*.quantity' => 'required|integer|min:1',
        'items.*.width' => 'nullable|numeric',
        
        'items.*.calibre' => 'nullable|numeric',
        'items.*.length' => 'nullable|numeric',
    ]);

    return DB::transaction(function () use ($data) {

        $order = Order::create([
            'order_number' => $data['order_number'],
            'nit' => $data['nit'] ?? null,
            'client_name' => $data['client_name'],
            'phone' => $data['phone'],
            'email' => $data['email'] ?? null,
            'ingreso_type' => $data['ingreso_type'],
            'creation_date' => $data['creation_date'] ?? null,
            'estimated_delivery_date' => $data['estimated_delivery_date'] ?? null,

            // ✅ no borrador
            'simple_status' => 'creado',

            // ✅ Opción B: FK válidas (ya confirmadas)
            'status_id' => 1,
            'created_by' => 1,
        ]);

        foreach ($data['items'] as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'description' => $item['description'],
                'quantity' => $item['quantity'],
                'width' => $item['width'] ?? 0,
                'calibre' => $item['calibre'] ?? 0,
                'length' => $item['length'] ?? 0,
            ]);
        }

        return response()->json([
            'message' => 'Orden creada correctamente',
            'order' => $order->load('items'),
        ], 201);
    });
}

public function destroy(Order $order)
{
    // Si tienes items relacionados
    $order->items()->delete();

    $order->delete();

    return response()->json(null, 204);
}

public function update(Request $request, Order $order)
{
    $validated = $request->validate([
        'order_number' => 'required|string',
        'nit' => 'required|string',
        'client_name' => 'required|string',
        'phone' => 'required|string',
        'email' => 'nullable|email',
        'ingreso_type' => 'required|in:interno,externo',
        'creation_date' => 'nullable|date',
        'estimated_delivery_date' => 'nullable|date',

        'items' => 'required|array|min:1',
        'items.*.description' => 'required|string',
        'items.*.quantity' => 'required|integer|min:1',
        'items.*.width' => 'nullable|numeric',
        'items.*.calibre' => 'nullable|numeric',
        'items.*.length' => 'nullable|numeric',
    ]);

    // 🔹 SOLO campos de la orden (sin items)
    $order->update([
        'order_number' => $validated['order_number'],
        'nit' => $validated['nit'],
        'client_name' => $validated['client_name'],
        'phone' => $validated['phone'],
        'email' => $validated['email'],
        'ingreso_type' => $validated['ingreso_type'],
        'creation_date' => $validated['creation_date'],
        'estimated_delivery_date' => $validated['estimated_delivery_date'],
    ]);

    // 🔥 ITEMS
    $order->items()->delete();

    foreach ($validated['items'] as $item) {
        $order->items()->create($item);
    }

    return response()->json([
        'message' => 'Orden actualizada correctamente'
    ]);
}



}
