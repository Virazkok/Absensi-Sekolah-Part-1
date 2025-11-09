<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Kehadiran;
use App\Models\Murid;
use Carbon\Carbon;

class AutoCheckout extends Command
{
    protected $signature = 'kehadiran:auto-checkout';
    protected $description = 'Tandai murid yang tidak absen (atau tidak check-out) menjadi Tidak Hadir';

    public function handle()
    {
        $today = Carbon::today()->toDateString();
        $this->info(" Hari ini: $today");

        // Update murid yang check-in tapi belum check-out
        $records = Kehadiran::whereDate('tanggal', $today)
            ->whereNotNull('jam_masuk')
            ->whereNull('jam_keluar')
            ->get();

        $this->info(" Jumlah check-in tanpa check-out: " . $records->count());

        foreach ($records as $presensi) {
            $presensi->update([
                'kehadiran' => 'Tidak Hadir',
                'jam_keluar' => null,
            ]);
            $this->info(" Update murid ID {$presensi->murid_id} → Tidak Hadir");
        }

        // Tambahkan murid yang sama sekali tidak absen
        $murids = Murid::all();
        $this->info(" Total murid: " . $murids->count());

        $newCount = 0;
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
    'jam_keluar' => null,
    'kehadiran'  => 'Tidak Hadir',
]);

                $this->info(" Tambah record murid ID {$murid->id} → Tidak Hadir");
                $newCount++;
            }
        }

        $this->info(" Total update: " . $records->count() . ", total baru: $newCount");
    }
}
