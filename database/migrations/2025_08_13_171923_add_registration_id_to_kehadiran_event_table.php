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
    Schema::table('kehadiran_event', function (Blueprint $table) {
        $table->unsignedBigInteger('registration_id')->nullable()->after('id');
        
        // Kalau mau ada relasi ke tabel event_registrations
        $table->foreign('registration_id')
              ->references('id')
              ->on('event_registrations')
              ->onDelete('cascade');
    });
}

public function down(): void
{
    Schema::table('kehadiran_event', function (Blueprint $table) {
        $table->dropForeign(['registration_id']);
        $table->dropColumn('registration_id');
    });
}

};
