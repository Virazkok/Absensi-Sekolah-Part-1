<?php

// app/Models/Event.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Event extends Model
{
    // app/Models/Event.php
    use SoftDeletes;
protected $table = "events";
protected $fillable = [
    'title',
    'description',
    'type',
    'start_date',
    'end_date',
    'is_published',
    'image',
];


protected $casts = [
    'sport_categories'      => 'array',
    'team_required_sports'  => 'array',
    'team_size'             => 'array',
    'start_date' => 'datetime',
    'end_date' => 'datetime',
    'is_published' => 'boolean'
];
    public function getIsSportAttribute(): bool
{
    return $this->type === 'olahraga';
}

    public function registrations()
    {
        return $this->hasMany(EventRegistration::class);
    }

    public function attendances()
    {
        return $this->hasMany(EventAttendance::class);
    }
}
