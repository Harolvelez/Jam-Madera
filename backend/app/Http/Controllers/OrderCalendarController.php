<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderCalendarController extends Controller
{
    public function index(Request $request)
    {
        $year  = $request->query('year', now()->year);
        $month = $request->query('month', now()->month);

        $orders = DB::table('orders as o')
            ->leftJoin('order_status as os', 'os.id', '=', 'o.status_id')
            ->whereYear('o.delivery_date', $year)
            ->whereMonth('o.delivery_date', $month)
            ->select(
                'o.id',
                'o.order_number',
                'o.delivery_date',
                'o.client_name as client',
                DB::raw('COALESCE(os.name, o.simple_status) as status')
            )
            ->orderBy('o.delivery_date')
            ->get();

        // Agrupar por día
        $days = [];

        foreach ($orders as $order) {
            $date = $order->delivery_date;

            if (!isset($days[$date])) {
                $days[$date] = [];
            }

            $days[$date][] = [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'client' => $order->client,
                'status' => $order->status,
            ];
        }

        return response()->json([
            'year' => (int) $year,
            'month' => (int) $month,
            'days' => $days
        ]);
    }
}
