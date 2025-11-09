<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventKehadiran extends Model
{
    protected $table = 'kehadiran_event';

    protected $fillable = [
        'event_id',
        'event_registration_id',
        'event_attendance_id',
        'murid_id',
        'attended_at',
        'scan_method',
        'status',
    ];

    protected $casts = [
        'attended_at' => 'datetime',
    ];

    protected $with = ['event', 'murid.kelas']; 

    public function event()
    {
        return $this->belongsTo(Event::class, 'event_id', 'id')->withTrashed();
    }

    public function registration()
    {
        return $this->belongsTo(EventRegistration::class, 'event_registration_id');
    }

    public function attendance()
    {
        return $this->belongsTo(EventAttendance::class, 'event_attendance_id');
    }

    public function murid()
    {
        return $this->belongsTo(Murid::class, 'murid_id');
    }
}
