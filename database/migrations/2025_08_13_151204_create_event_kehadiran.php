<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_kehadiran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->onDelete('cascade');
            $table->foreignId('event_registration_id')->constrained('event_registrations')->onDelete('cascade');
            $table->foreignId('event_attendance_id')->nullable()->constrained('event_attendances')->onDelete('set null');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('attended_at')->nullable(); // waktu hadir
            $table->string('status')->default('hadir');   // hadir, izin, sakit, dll

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_kehadiran');
    }
};
