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
         Schema::table('users', function (Blueprint $table) {
        // Pastikan tipe data sama dengan id di eskul (biasanya bigInteger unsigned)
        $table->unsignedBigInteger('eskul_siswa1_id')->nullable();
        $table->unsignedBigInteger('eskul_siswa2_id')->nullable();
        $table->unsignedBigInteger('eskul_siswa3_id')->nullable();

        // Tambahkan foreign key setelah kolom dibuat
        $table->foreign('eskul_siswa1_id')->references('id')->on('eskuls');
        $table->foreign('eskul_siswa2_id')->references('id')->on('eskuls');
        $table->foreign('eskul_siswa3_id')->references('id')->on('eskuls');
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            //
        });
    }
};
