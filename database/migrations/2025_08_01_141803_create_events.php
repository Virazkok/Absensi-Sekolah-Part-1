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
       
// database/migrations/xxxx_xx_xx_create_events_table.php
Schema::create('events', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('description');
    $table->enum('type', ['olahraga', 'non-olahraga', 'pemberitahuan']);
    $table->dateTime('start_date');
    $table->dateTime('end_date');
    $table->boolean('is_published')->default(false);
    $table->json('sport_categories')->nullable();
    $table->timestamps();
});

// database/migrations/xxxx_xx_xx_create_event_registrations_table.php
Schema::create('event_registrations', function (Blueprint $table) {
    $table->id();
    $table->foreignId('event_id')->constrained();
    $table->foreignId('user_id')->constrained();
    $table->string('sport_category')->nullable();
    $table->json('team_members')->nullable();
    $table->timestamps();
});

// database/migrations/xxxx_xx_xx_create_event_attendances_table.php
Schema::create('event_attendances', function (Blueprint $table) {
    $table->id();
    $table->foreignId('event_id')->constrained();
    $table->foreignId('user_id')->constrained();
    $table->timestamp('attended_at')->nullable();
    $table->string('qr_code')->nullable();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
