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
        $request->validate([
            'order_number' => 'required|unique:orders,order_number',
            'client_id' => 'required|integer',
            'delivery_date' => 'required|date',
            'created_by' => 'required|integer'
        ]);

        $order = Order::create($request->all());

        return response()->json($order, 201);
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
