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
            // usar delivery_date si existe, sino estimated_delivery_date
            ->whereRaw('year(COALESCE(o.delivery_date, o.estimated_delivery_date)) = ?', [$year])
            ->whereRaw('month(COALESCE(o.delivery_date, o.estimated_delivery_date)) = ?', [$month])
            ->select(
                'o.id',
                'o.order_number',
                DB::raw('COALESCE(o.delivery_date, o.estimated_delivery_date) as delivery_date'),
                'o.client_name as client',
                DB::raw('COALESCE(os.name, o.simple_status) as status')
            )
            ->orderByRaw('COALESCE(o.delivery_date, o.estimated_delivery_date)')
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
