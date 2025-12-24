<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\Client;
use App\Models\User;

class OrdersSeeder extends Seeder
{
    public function run()
    {
        $user = User::first();      // quien crea la orden
        $clients = Client::all();   // clientes existentes

        if (!$user || $clients->isEmpty()) {
            $this->command->warn('No hay usuarios o clientes suficientes');
            return;
        }

        foreach ($clients as $index => $client) {

            $order = Order::create([
                'order_number' => 'ORD-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                'client_id'    => $client->id,
                'delivery_date'=> now()->addDays(rand(3, 15)),
                'status_id'    => rand(1, 4), // creado → para_entrega
                'created_by'   => $user->id,
            ]);

            // Historial inicial
            OrderStatusHistory::create([
                'order_id'   => $order->id,
                'status_id'  => $order->status_id,
                'changed_by' => $user->id,
                'changed_at' => now(),
            ]);
        }

        $this->command->info('Órdenes de prueba creadas correctamente');
    }
}
