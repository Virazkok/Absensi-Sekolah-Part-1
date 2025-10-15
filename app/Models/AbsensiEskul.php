<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AbsensiEskul extends Model
{
    protected $table = 'absensi_eskuls';
    /**
     * 
     *
     * @var array<string>
     */
    protected $fillable = [
        'eskul_id', 'day_of_week', 'is_recurring',
        'tanggal', 'jam_mulai', 'jam_selesai', 'dipublish'
    ];

    public function eskul()
    {
        return $this->belongsTo(Eskul::class, 'eskul_id');
    }

    public function kehadiranEskuls()
    {
        return $this->hasMany(KehadiranEskul::class, 'absensi_eskul_id');
    }

    // app/Models/AbsensiEskul.php
public function kehadiran()
{
    return $this->hasMany(KehadiranEskul::class, 'absensi_eskul_id');
}
    // app/Models/AbsensiEskul.php
protected $casts = [
    'tanggal'   => 'date:Y-m-d',
    'dipublish' => 'boolean',
];

// controller
public function detailAbsensi(AbsensiEskul $absensi)
{
    $absensi->load('eskul:id,nama', 'kehadiran.user');
    return inertia('Admin/DetailAbsensi', [
        'absensi' => $absensi,
    ]);
}



    
}