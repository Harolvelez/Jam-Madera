<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OrderStatusHistory;

class AuditController extends Controller
{
    public function index(Request $request)
    {
        $query = OrderStatusHistory::with([
            'order:id,order_number',
            'status:id,name',
            'user:id,name,email',
        ]);

        // 🔍 Filtro por Order ID
        if ($request->filled('order_id')) {
            $query->where('order_id', $request->order_id);
        }

        // 🔍 Filtro por usuario
        if ($request->filled('changed_by')) {
            $query->where('changed_by', $request->changed_by);
        }

        // 🔍 Filtro por fecha desde
        if ($request->filled('from')) {
            $query->whereDate('changed_at', '>=', $request->from);
        }

        // 🔍 Filtro por fecha hasta
        if ($request->filled('to')) {
            $query->whereDate('changed_at', '<=', $request->to);
        }

        return response()->json(
            $query
                ->orderBy('changed_at', 'desc')
                ->paginate(20)
        );
    }

    /**
     * ✅ Eliminar historial por IDs (solo Admin/Gerente vía middleware)
     * Body esperado:
     * { "ids": [1,2,3] }
     */
    public function destroyMany(Request $request)
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ]);

        $deleted = OrderStatusHistory::whereIn('id', $data['ids'])->delete();

        return response()->json([
            'message' => 'Historial eliminado',
            'deleted' => $deleted,
        ]);
    }
}
