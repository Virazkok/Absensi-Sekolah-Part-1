<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Event extends Model
{
    use SoftDeletes;

    protected $table = "events";

    protected $fillable = [
        'title',
        'description',
        'type',
        'start_date',
        'location',
        'end_date',
        'is_published',
        'image',
    ];

    protected $casts = [
        'sport_categories' => 'array',
        'team_required_sports' => 'array',
        'team_size' => 'array',
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

   
    public function getImageUrlAttribute()
    {
        if ($this->image) {
            if (str_starts_with($this->image, 'data:image')) {
                return $this->image;
            }
        }
        return asset('images/default-event.png');
    }
}
