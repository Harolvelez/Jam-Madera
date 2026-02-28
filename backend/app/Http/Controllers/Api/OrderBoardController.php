<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderStatus;
use App\Models\OrderStatusHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderBoardController extends Controller
{
    /**
     * Obtener tablero estilo Trello
     */
    public function board()
    {
        $statuses = OrderStatus::with([
            'orders' => function ($q) {
                $q->with(['lastStatusHistory'])
                  ->orderBy('created_at', 'asc');
            }
        ])->orderBy('id')->get();

        // Ocultar órdenes entregadas con más de 30 días desde el cambio de estado
        $cutoffDate = now()->subDays(30);

        $statuses->each(function ($status) use ($cutoffDate) {
            if (strtolower($status->name) === 'finalizado') {
                $status->setRelation('orders',
                    $status->orders->filter(function ($order) use ($cutoffDate) {
                        $changedAt = $order->lastStatusHistory?->changed_at;
                        if (!$changedAt) return true;
                        return \Carbon\Carbon::parse($changedAt)->gte($cutoffDate);
                    })->values()
                );
            }
        });

        return response()->json($statuses);
    }

    /**
     * Mover orden a otro estado
     */
    public function move(Request $request, $orderId)
    {
        $request->validate([
            'status_id' => 'required|exists:order_status,id'
        ]);

        DB::transaction(function () use ($request, $orderId) {
            $order = Order::findOrFail($orderId);

            // Actualizar estado actual
            $order->update([
                'status_id' => $request->status_id
            ]);

            // Guardar historial
            OrderStatusHistory::create([
                'order_id'  => $order->id,
                'status_id' => $request->status_id,
                'changed_by'=> auth()->id(),
                'changed_at'=> now(),
            ]);
        });

        return response()->json([
            'message' => 'Estado actualizado correctamente'
        ]);
    }
}