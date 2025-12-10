<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderStatusHistory;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    // Mostrar todas las órdenes
    public function index()
    {
        return Order::with(['client', 'items', 'status', 'creator'])
            ->orderBy('id', 'desc')
            ->get();
    }

    // Crear nueva orden
    public function store(Request $request)
{
    $user = $request->user(); // usuario autenticado con sanctum

    // VALIDACIÓN ORDEN + ITEMS
    $data = $request->validate([
        'order_number'  => 'required|string|max:20|unique:orders,order_number',
        'client_id'     => 'required|integer|exists:clients,id',
        'description'   => 'required|string',
        'delivery_date' => 'nullable|date',

        'items'                   => 'required|array|min:1',
        'items.*.description'     => 'required|string',
        'items.*.quantity'        => 'required|integer|min:1',
        'items.*.width'           => 'required|numeric|min:0',
        'items.*.height'          => 'required|numeric|min:0',
        'items.*.length'          => 'required|numeric|min:0',
    ]);

    // Crear la orden
    $order = Order::create([
        'order_number'  => $data['order_number'],
        'client_id'     => $data['client_id'],
        'description'   => $data['description'],
        'delivery_date' => $data['delivery_date'] ?? null,
        'status_id'     => 1,              // creado
        'created_by'    => $user->id,
    ]);

    // Crear los items
    foreach ($data['items'] as $item) {
        \App\Models\OrderItem::create([
            'order_id'   => $order->id,
            'description'=> $item['description'],
            'quantity'   => $item['quantity'],
            'width'      => $item['width'],
            'height'     => $item['height'],
            'length'     => $item['length'],
        ]);
    }

    // Registrar historial
    OrderStatusHistory::create([
        'order_id' => $order->id,
        'status_id' => 1, // creado
        'changed_by' => $user->id,
    ]);

    return response()->json([
        'message' => 'Orden creada con éxito',
        'order'   => $order->load(['client', 'items', 'status']),
    ], 201);
}


    // Mostrar una orden
    public function show($id)
    {
        return Order::with(['client', 'items', 'status', 'history'])->findOrFail($id);
    }

    // Editar información (NO afecta estado)
    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $order->update($request->only(['delivery_date']));

        return response()->json($order);
    }

    // Cambiar estado (para el tablero tipo Kanban)
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status_id' => 'required|integer'
        ]);

        $order = Order::findOrFail($id);

        $order->status_id = $request->status_id;
        $order->save();

        // Registramos historial
        OrderStatusHistory::create([
            'order_id' => $order->id,
            'status_id' => $request->status_id,
            'changed_by' => auth()->id(),
            // changed_at lo llena la BD automáticamente
        ]);

        return response()->json([
            'message' => 'Estado actualizado',
            'order' => $order
        ]);
    }

    // Eliminar orden (si se permite)
    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();

        return response()->json(['message' => 'Orden eliminada']);
    }
}