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
        Schema::table('costs', function (Blueprint $table) {
            Schema::table('costs', function (Blueprint $blueprint) {
            // Cambiamos 'price' a decimal con 10 dígitos en total y 2 decimales
            $blueprint->decimal('price', 10, 2)->change();
        });
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('costs', function (Blueprint $table) {
            //
        });
    }
};
