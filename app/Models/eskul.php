<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Eskul extends Model
{
    protected $fillable = ['nama', 'deskripsi'];

    public function murid()
    {
        return $this->belongsToMany(Murid::class, 'murid_eskul', 'eskul_id', 'murid_id');
    }

    public function absensiEskul()
    {
        return $this->hasMany(AbsensiEskul::class);
    }
    public function siswa() { return $this->belongsToMany(User::class, 'eskul_user', 'eskul_id', 'user_id'); }
}
