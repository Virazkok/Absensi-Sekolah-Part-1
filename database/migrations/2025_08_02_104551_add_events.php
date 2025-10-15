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
        Schema::table('events', function (Blueprint $table) {
        $table->json('team_required_sports')->nullable(); // ['Futsal', 'Basket']
        $table->unsignedTinyInteger('team_size')->nullable(); // 5
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
