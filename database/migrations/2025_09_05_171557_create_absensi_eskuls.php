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
        Schema::create('absensi_eskuls', function (Blueprint $table) {
    $table->id();
    $table->foreignId('eskul_id')->constrained('eskuls')->onDelete('cascade');
    $table->unsignedTinyInteger('day_of_week')->nullable(); // 0 = Minggu, dst
    $table->boolean('is_recurring')->default(true); // true = mingguan, false = sekali
    $table->date('tanggal')->nullable(); // kalau absensi sekali (bukan mingguan)
    $table->time('jam_mulai');
    $table->time('jam_selesai');
    $table->boolean('dipublish')->default(true);
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('absensi_eskuls');
    }
};
