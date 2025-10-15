<?php

    namespace App\Models;

    use Illuminate\Database\Eloquent\Model;

    class Kelas extends Model
    {
        protected $table = "kelas";
        protected $fillable = ['name'];

        public function students()
        {
            return $this->hasMany(murid::class);
        }

        public function attendances()
        {
            return $this->hasManyThrough(kehadiran::class, murid::class);
        }
    }
