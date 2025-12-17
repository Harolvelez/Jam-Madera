<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::table('orders', function (Blueprint $table) {
        $table->string('nit')->nullable()->after('order_number');
        $table->string('client_name')->nullable()->after('nit');
        $table->date('estimated_delivery_date')->nullable()->after('client_name');
        $table->string('simple_status')->default('borrador')->after('estimated_delivery_date');
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
{
    Schema::table('orders', function (Blueprint $table) {
        $table->dropColumn([
            'nit',
            'client_name',
            'estimated_delivery_date',
            'simple_status',
        ]);
    });
}

};
