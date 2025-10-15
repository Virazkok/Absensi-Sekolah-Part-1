<?php

// app/Models/EventRegistration.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventRegistration extends Model
{
    protected $fillable = [
        'event_id',
        'user_id',
        'sport_category',
        'qr_token'
    ];

    

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function Murid()
    {
        return $this->belongsTo(Murid::class)->with('kelas_id');
    }
}
