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
        Schema::create('kehadiran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('murid_id')->constrained('murid');
            $table->foreignId('kelas_id')->constrained('kelas');
            $table->date('tanggal');
            $table->time('jam_masuk');
            $table->string('kehadiran')->default('hadir'); // hadir, telat, alpha
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kehadiran');
    }
};
