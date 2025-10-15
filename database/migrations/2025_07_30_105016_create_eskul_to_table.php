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
        // database/migrations/xxxx_create_eskul_tables.php
Schema::create('eskuls', function (Blueprint $table) {
    $table->id();
    $table->string('nama');
    $table->text('deskripsi')->nullable();
    $table->timestamps();
});

Schema::create('absensi_eskuls', function (Blueprint $table) {
    $table->id();
    $table->foreignId('eskul_id')->constrained();
    $table->date('tanggal');
    $table->time('jam_mulai');
    $table->time('jam_selesai');
    $table->boolean('dipublish')->default(false);
    $table->timestamps();
});

Schema::create('kehadiran_eskuls', function (Blueprint $table) {
    $table->id();
    $table->foreignId('absensi_eskul_id')->constrained();
    $table->foreignId('user_id')->constrained();
    $table->string('foto_path');
    $table->timestamp('waktu_absen')->useCurrent();
    $table->enum('status', ['hadir', 'izin', 'alpa'])->default('hadir');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('eskul_to');
    }
};
