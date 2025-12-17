<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\OrderStatus;

class OrderStatusSeeder extends Seeder
{
    public function run(): void
    {
        OrderStatus::firstOrCreate([
            'name' => 'creado',
        ]);

        OrderStatus::firstOrCreate([
            'name' => 'producción',
        ]);

        OrderStatus::firstOrCreate([
            'name' => 'terminado',
        ]);

        OrderStatus::firstOrCreate([
            'name' => 'finalizado',
        ]);
    }
}

