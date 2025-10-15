<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Murid;
use App\Models\Kehadiran;
use Carbon\Carbon;

class MarkAbsentStudents extends Command
{
    protected $signature = 'attendance:mark-absent';
    protected $description = 'Tandai murid yang tidak absen hari ini sebagai Tidak Hadir';

    public function handle()
    {
        $today = Carbon::today()->toDateString();

        $murids = Murid::all();

        foreach ($murids as $murid) {
            $sudahAbsen = Kehadiran::where('murid_id', $murid->id)
                ->whereDate('tanggal', $today)
                ->exists();

            if (!$sudahAbsen) {
                Kehadiran::create([
                    'murid_id'   => $murid->id,
                    'kelas_id'   => $murid->kelas_id,
                    'tanggal'    => $today,
                    'jam_masuk'  => null,
                    'kehadiran'  => 'Tidak Hadir',
                ]);
            }
        }

        $this->info("Selesai menandai murid yang tidak hadir pada $today.");
    }
}
