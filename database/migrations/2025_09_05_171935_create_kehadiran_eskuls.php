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
        Schema::create('kehadiran_eskuls', function (Blueprint $table) {
    $table->id();
    $table->foreignId('absensi_eskul_id')->constrained()->onDelete('cascade');
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->date('tanggal'); // absensi per hari
    $table->time('jam_absen');
    $table->enum('status', ['hadir', 'izin', 'sakit', 'alpa'])->default('hadir');
    $table->string('foto')->nullable(); // simpan path foto
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kehadiran_eskuls');
    }
};
