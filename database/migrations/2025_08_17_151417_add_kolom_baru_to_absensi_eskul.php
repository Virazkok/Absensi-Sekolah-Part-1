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
        Schema::table('absensi_eskuls', function (Blueprint $table) {
            $table->tinyInteger('day_of_week')->nullable()->after('eskul_id'); // 0=Senin .. 6=Minggu
            $table->boolean('is_recurring')->default(false)->after('day_of_week');
        });
    }

    public function down(): void
    {
        Schema::table('absensi_eskuls', function (Blueprint $table) {
            $table->dropColumn(['day_of_week', 'is_recurring']);
        });
    }
};
