<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatus;
use App\Models\OrderStatusHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /* =========================
       LISTAR ÓRDENES
    ========================= */
    public function index()
    {
        return Order::select(
            'id',
            'order_number',
            'client_name',
            'nit',
            'creation_date',
            'estimated_delivery_date'
        )
        ->orderBy('id', 'desc')
        ->get();
    }

    /* =========================
       VER DETALLE
    ========================= */
    public function show($id)
    {
        return Order::with('items')->findOrFail($id);
    }

    /* =========================
       NEXT NUMBER
    ========================= */
    // NEXT NUMBER (ORD-0001 .. ORD-9999, ORD-A0001 .. ORD-Z9999, luego vuelve a ORD-0001)
public function nextNumber()
{
    $last = Order::orderBy('id', 'desc')->first();

    // si no hay nada, empieza normal
    if (!$last || !$last->order_number) {
        return response()->json(['next' => 'ORD-0001']);
    }

    $lastStr = strtoupper(trim((string) $last->order_number));

    // Formatos válidos:
    // ORD-0001
    // ORD-A0001
    // (letra opcional + 4 dígitos)
    if (preg_match('/^ORD\-([A-Z])?(\d{4})$/', $lastStr, $m)) {
        $letter = $m[1] ?? null;      // null = sin letra
        $num    = intval($m[2]);      // 0001..9999

        if ($num < 9999) {
            $num++;
        } else {
            // num == 9999 -> avanzar "serie"
            if ($letter === null) {
                $letter = 'A';
            } elseif ($letter !== 'Z') {
                $letter = chr(ord($letter) + 1);
            } else {
                // Z9999 -> vuelve a sin letra
                $letter = null;
            }
            $num = 1;
        }

        $suffix = str_pad((string) $num, 4, '0', STR_PAD_LEFT);
        $next = $letter ? "ORD-{$letter}{$suffix}" : "ORD-{$suffix}";

        return response()->json(['next' => $next]);
    }

    // Fallback (por si tienes números viejos tipo ORD-10000):
    // Si ya pasó de 9999 con el formato viejo, arrancamos la serie A0001
    $digits = intval(preg_replace('/\D/', '', $lastStr));
    if ($digits >= 9999) {
        return response()->json(['next' => 'ORD-A0001']);
    }

    $nextNumber = $digits + 1;
    return response()->json([
        'next' => 'ORD-' . str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT),
    ]);
}


    /* =========================
       CREAR ORDEN
    ========================= */
    public function store(Request $request)
    {
        $data = $request->validate([
            'order_number' => 'required|string|max:20|unique:orders,order_number',
            'nit' => 'nullable|string|max:50',
            'client_name' => 'required|string|max:255',
            'phone' => 'required|string|max:30',
            'email' => 'nullable|email|max:255',
            'ingreso_type' => 'required|in:Factura,Pedido',
            'creation_date' => 'nullable|date',
            'estimated_delivery_date' => 'nullable|date',
            'numero_factura' => 'nullable|string|max:100',
            'metodo_pago' => 'nullable|in:Banco,Efectivo',

            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
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
                'numero_factura' => $data['numero_factura'] ?? null,
                'metodo_pago' => $data['metodo_pago'] ?? null,
                'simple_status' => 'creado',
                'status_id' => 1,
                'created_by' => 1,
            ]);

            foreach ($data['items'] as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'description' => $item['description'],
                    'quantity' => 0,
                    'width' => 0,
                    'length' => 0,
                    'calibre' => 0,
                ]);
            }

            return response()->json([
                'message' => 'Orden creada correctamente',
                'order' => $order->load('items'),
            ], 201);
        });
    }

    /* =========================
       ACTUALIZAR ORDEN
    ========================= */
    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'order_number' => 'required|string',
            'nit' => 'required|string',
            'client_name' => 'required|string',
            'phone' => 'required|string',
            'email' => 'nullable|email',
            'ingreso_type' => 'required|in:Factura,Pedido',
            'creation_date' => 'nullable|date',
            'estimated_delivery_date' => 'nullable|date',
            'numero_factura' => 'nullable|string|max:100',
            'metodo_pago' => 'nullable|in:Banco,Efectivo',

            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
        ]);

        // 🔹 actualizar orden
        $order->update([
            'order_number' => $validated['order_number'],
            'nit' => $validated['nit'],
            'client_name' => $validated['client_name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'],
            'ingreso_type' => $validated['ingreso_type'],
            'creation_date' => $validated['creation_date'],
            'estimated_delivery_date' => $validated['estimated_delivery_date'],
            'numero_factura' => $validated['numero_factura'] ?? null,
            'metodo_pago' => $validated['metodo_pago'] ?? null,
        ]);

        // 🔥 reemplazar items
        $order->items()->delete();

        foreach ($validated['items'] as $item) {
            $order->items()->create([
                'description' => $item['description'],
                'quantity' => 0,
                'width' => 0,
                'length' => 0,
                'calibre' => 0,
            ]);
        }

        return response()->json([
            'message' => 'Orden actualizada correctamente',
        ]);
    }

    /* =========================
       ELIMINAR
    ========================= */
    public function destroy(Order $order)
    {
        // si hay historiales asociados, no permitimos borrar (auditoría)
        if (OrderStatusHistory::where('order_id', $order->id)->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar la orden porque tiene registros en el historial de estados.'
            ], 422);
        }

        return DB::transaction(function () use ($order) {
            $order->items()->delete();
            $order->delete();

            return response()->json(null, 204);
        });
    }

    /* =========================
       BOARD / KANBAN
    ========================= */
    public function board()
    {
        $statuses = OrderStatus::with(['orders' => function ($query) {
            $query->orderBy('created_at', 'desc');
        }])->get();

        return response()->json($statuses);
    }
}
