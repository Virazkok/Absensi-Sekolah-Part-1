<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
    'name',
    'email',
    'username',
    'password',
    'kelas_id',
    'keahlian',
    'nis',
    'role',
    'status',
    'avatar',
    'avatar_path',
    'eskul_siswa1_id',
    'eskul_siswa2_id',
    'eskul_siswa3_id',
];


    protected $appends = ['avatar_url'];

    public function getAvatarUrlAttribute()
    {
        return $this->avatar ?: null;
    }
    public function eskuls() { return $this->belongsToMany(Eskul::class, 'eskul_user', 'user_id', 'eskul_id'); }
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class);
    }

    public function murid()
    {
        return $this->hasOne(Murid::class, 'user_id');
    }

    public function getMuridNisAttribute()
{
    return $this->murid?->nis;
}
    public function eventRegistrations()
    {
        return $this->hasMany(EventRegistration::class);
    }

    public function eventAttendances()
    {
        return $this->hasMany(EventAttendance::class);
    }
}
