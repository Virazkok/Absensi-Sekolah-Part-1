<?php

// app/Models/EventAttendance.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventAttendance extends Model
{
    protected $table = 'kehadiran_event';
    protected $fillable = [
        'event_id',
        'user_id',
        'murid_id',
        'attended_at'
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class)->with('murid');
    }
}