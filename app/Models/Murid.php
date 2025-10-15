<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Murid extends Model
{
    protected $table = "murid";

    protected $fillable = [
    'nis',
    'nama',
    'email',       // ✅ tambahkan
    'kelas_id',
    'keahlian',
    'qr_token',
    'token_expired_at',
    'user_id'
];



    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'kelas_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function eskuls()
    {
        return $this->belongsToMany(Eskul::class, 'murid_eskul', 'murid_id', 'eskul_id');
    }

    public function attendances()
    {
        return $this->hasMany(Kehadiran::class);
    }
}
