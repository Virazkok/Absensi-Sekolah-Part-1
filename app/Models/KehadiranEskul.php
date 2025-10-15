<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KehadiranEskul extends Model
{
    protected $table = 'kehadiran_eskuls';

    protected $fillable = [
        'absensi_eskul_id', 'user_id', 'tanggal',
        'jam_absen', 'status', 'foto'
    ];

    public function absensi()
    {
        return $this->belongsTo(AbsensiEskul::class, 'absensi_eskul_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

