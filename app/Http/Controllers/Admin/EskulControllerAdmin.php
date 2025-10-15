<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AbsensiEskul;
use App\Models\Eskul;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EskulControllerAdmin extends Controller
{
   public function index(Request $request)
{
    $search = $request->input('search');

    $eskuls = Eskul::with(['siswa.kelas', 'absensiEskul']) // <-- tambahkan ini
        ->when($search, function ($q) use ($search) {
            $q->where('nama', 'like', "%{$search}%")
              ->orWhereHas('siswa', fn($qs) =>
                  $qs->where('name', 'like', "%{$search}%")
              );
        })
        ->get()
        ->map(function ($eskul) {
            return [
                'id'    => $eskul->id,
                'nama'  => $eskul->nama,
                'siswa' => $eskul->siswa()->with('kelas')->paginate(5),
                'absensiEskul' => $eskul->absensiEskul, // <-- kirim ke frontend
            ];
        });

    return inertia('Admin/AdminEskul', [
        'eskuls'  => $eskuls,
        'filters' => ['search' => $search],
    ]);
}





    public function show(Eskul $eskul)
{
    $eskul->refresh()->load([
        'siswa.kelas',
        'absensiEskul.kehadiran.user'
    ]);

    return inertia('Admin/AdminEskulDetail', [
        'eskul'   => $eskul,
        'anggota' => $eskul->siswa,
        'absensi' => $eskul->absensiEskul,
    ]);
}


    public function store(Request $request)
{
    $data = $request->validate([
        'nama'      => 'required|string|max:255',
        'deskripsi' => 'nullable|string',
        'schedules' => 'nullable|array',
        'schedules.*.day_of_week' => 'required|integer|min:0|max:6',
        'schedules.*.jam_mulai'   => 'required|date_format:H:i',
        'schedules.*.jam_selesai' => 'required|date_format:H:i|after:schedules.*.jam_mulai',
    ]);

    $eskul = Eskul::create([
        'nama'      => $data['nama'],
        'deskripsi' => $data['deskripsi'] ?? null,
    ]);

    if (!empty($data['schedules'])) {
        foreach ($data['schedules'] as $schedule) {
            AbsensiEskul::create([
                'eskul_id'    => $eskul->id,
                'day_of_week' => $schedule['day_of_week'],
                'is_recurring'=> true,
                'tanggal'     => null,
                'jam_mulai'   => $schedule['jam_mulai'],
                'jam_selesai' => $schedule['jam_selesai'],
                'dipublish'   => true,
            ]);
        }
    }

    return redirect()->route('admin.eskul.index')->with('success', 'Eskul berhasil ditambahkan');
}

public function update(Request $request, Eskul $eskul)
{
    $data = $request->validate([
        'nama'       => 'required|string|max:255',
        'deskripsi'  => 'nullable|string',
        'schedules'  => 'nullable|array',
    ]);

    // 🔹 Update data utama eskul
    $eskul->update([
        'nama'      => $data['nama'],
        'deskripsi' => $data['deskripsi'] ?? null,
    ]);

    // 🔹 Kelola jadwal - PERBAIKAN: Jangan hapus data kehadiran
    if (!empty($data['schedules'])) {
        // Hapus hanya jadwal recurring yang belum memiliki kehadiran
        $eskul->absensiEskul()
            ->where('is_recurring', true)
            ->whereDoesntHave('kehadiran') // Hanya hapus jadwal yang belum ada kehadiran
            ->delete();

        // Simpan jadwal baru
        foreach ($data['schedules'] as $schedule) {
            // Cek apakah jadwal dengan hari yang sama sudah ada
            $existingSchedule = $eskul->absensiEskul()
                ->where('day_of_week', $schedule['day_of_week'])
                ->where('is_recurring', true)
                ->first();

            if ($existingSchedule) {
                // Update jadwal yang sudah ada
                $existingSchedule->update([
                    'jam_mulai'   => $schedule['jam_mulai'],
                    'jam_selesai' => $schedule['jam_selesai'],
                ]);
            } else {
                // Buat jadwal baru
                $eskul->absensiEskul()->create([
                    'day_of_week' => $schedule['day_of_week'],
                    'jam_mulai'   => $schedule['jam_mulai'],
                    'jam_selesai' => $schedule['jam_selesai'],
                    'is_recurring'=> true,
                    'dipublish'   => true,
                ]);
            }
        }
    }

    return redirect()->route('admin.eskul.show', $eskul->id)
        ->with('success', 'Eskul berhasil diperbarui.');
}


    public function destroy(Eskul $eskul)
    {
        $eskul->siswa()->detach();
        $eskul->absensiEskul()->delete();
        $eskul->delete();

        return redirect()->route('admin.eskul.index')->with('success', 'Eskul berhasil dihapus');
    }
}
