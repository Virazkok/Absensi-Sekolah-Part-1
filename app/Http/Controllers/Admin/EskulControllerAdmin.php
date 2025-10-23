<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AbsensiEskul;
use App\Models\Eskul;
use App\Models\User;
use App\Models\Kelas;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class EskulControllerAdmin extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $eskuls = Eskul::with('siswa.kelas')
    ->when($search, function ($q) use ($search) {
        $q->where('nama', 'like', "%{$search}%")
          ->orWhereHas('siswa', fn($qs) =>
              $qs->where('name', 'like', "%{$search}%")
          );
    })
    ->get()
    ->map(function ($eskul) {
        return [
            'id' => $eskul->id,
            'nama' => $eskul->nama,
            'siswa' => $eskul->siswa()->with('kelas')->paginate(5),
        ];
    });


        // Semua user untuk modal tambah anggota: sertakan kelas, daftar eskul ids dan count eskul
        $allUsers = User::with('kelas')
            ->with('eskuls:id') // ambil relasi eskuls minimal id
            ->withCount('eskuls')
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'kelas' => $u->kelas ? ['id' => $u->kelas->id, 'name' => $u->kelas->name] : null,
                    'eskuls_count' => $u->eskuls_count,
                    // daftar eskul id yang sedang dimiliki user
                    'eskuls_ids' => $u->eskuls->pluck('id')->toArray(),
                ];
            });

        $kelasList = Kelas::select('id', 'name')->get();

        return Inertia::render('Admin/AdminEskul', [
            'eskuls'     => $eskuls,
            'filters'    => ['search' => $search],
            'allUsers'   => $allUsers,
            'kelasList'  => $kelasList,
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

public function addMembers(Request $request)
    {
        $data = $request->validate([
            'selections' => 'required|array',
            'selections.*.eskul_id' => 'required|integer|exists:eskuls,id',
            'selections.*.user_ids' => 'required|array',
            'selections.*.user_ids.*' => 'integer|exists:users,id',
        ]);

        // flatten unique user ids from payload
        $allUserIds = collect($data['selections'])->flatMap(fn($s) => $s['user_ids'])->unique()->values()->all();

        // compute how many distinct new eskul for each user (in this payload)
        $userNewCounts = [];
        foreach ($allUserIds as $uid) $userNewCounts[$uid] = 0;

        foreach ($data['selections'] as $sel) {
            $uniqueUserIds = array_values(array_unique($sel['user_ids']));
            foreach ($uniqueUserIds as $u) {
                $userNewCounts[$u] = ($userNewCounts[$u] ?? 0) + 1;
            }
        }

        // validate against existing count (DB)
        $errors = [];
        foreach ($userNewCounts as $uid => $newCount) {
            $user = User::find($uid);
            if (!$user) continue;
            $existing = $user->eskuls()->count();
            if ($existing + $newCount > 3) {
                $errors[$uid] = "Siswa {$user->name} sudah memiliki {$existing} eskul, menambah {$newCount} melebihi batas 3.";
            }
        }

        if (!empty($errors)) {
            return response()->json(['message' => 'Beberapa siswa melebihi batas eskul', 'errors' => $errors], 422);
        }

        // lakukan DB transaction: attach ke pivot lalu sinkron ke kolom eskul_siswa1..3
        DB::beginTransaction();
        try {
            foreach ($data['selections'] as $sel) {
                $eskul = Eskul::find($sel['eskul_id']);
                if (!$eskul) continue;

                // attach tanpa duplikasi
                $eskul->siswa()->syncWithoutDetaching(array_values(array_unique($sel['user_ids'])));
            }

            // setelah melakukan attach di pivot, update kolom eskul_siswa1..3 untuk setiap user yang terdampak
            foreach ($allUserIds as $uid) {
                $user = User::find($uid);
                if (!$user) continue;

                // refresh relasi dan ambil eskul ids terbaru (urut by id)
                $user->load('eskuls');
                $eskulIds = $user->eskuls()->pluck('eskuls.id')->toArray();

                // pastikan mengambil maximal 3
                $eskulIds = array_slice($eskulIds, 0, 3);

                $user->eskul_siswa1_id = $eskulIds[0] ?? null;
                $user->eskul_siswa2_id = $eskulIds[1] ?? null;
                $user->eskul_siswa3_id = $eskulIds[2] ?? null;
                $user->save();
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menyimpan anggota: '.$e->getMessage()], 500);
        }

        return response()->json(['message' => 'Anggota berhasil ditambahkan']);
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

    public function removeMember(Request $request, Eskul $eskul)
{
    $userId = $request->input('user_id');
    $user = \App\Models\User::findOrFail($userId);

    // Hapus dari pivot
    $eskul->siswa()->detach($userId);

    // Update kolom di tabel users
    $columns = ['eskul_siswa1_id', 'eskul_siswa2_id', 'eskul_siswa3_id'];
    foreach ($columns as $col) {
        if ($user->$col === $eskul->id) {
            $user->update([$col => null]);
            break;
        }
    }

    return response()->json(['success' => true]);
}

}
