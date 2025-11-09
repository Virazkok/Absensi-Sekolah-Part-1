<?php

// app/Models/EventAttendance.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventAttendance extends Model
{
    protected $table = 'kehadiran_event';
    protected $fillable = [
        'event_id', 'user_id', 'murid_id', 'attended_at', 'registration_id'
    ];

    public function event() { return $this->belongsTo(Event::class); }

    public function user() { return $this->belongsTo(User::class)->with('kelas', 'murid.kelas'); }

    public function murid() { return $this->belongsTo(Murid::class); }

    public function getDisplayNameAttribute()
    {
        return $this->user->name
            ?? optional($this->murid)->nama
            ?? 'Tidak diketahui';
    }

    public function getKelasNameAttribute()
    {
        return $this->user->kelas->name
            ?? optional($this->murid->kelas)->name
            ?? '-';
    }
}
