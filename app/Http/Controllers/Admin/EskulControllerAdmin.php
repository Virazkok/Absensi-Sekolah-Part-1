<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Eskul;
use App\Models\User;
use App\Models\AbsensiEskul;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class EskulControllerAdmin extends Controller
{
    public function index(Request $request)
{
    $search = $request->get('search');

    $eskuls = Eskul::with(['siswa.kelas', 'absensiEskul'])
    ->when($search, function ($q) use ($search) {
        $q->where('nama', 'like', "%{$search}%")
          ->orWhereHas('siswa', fn($qs) => $qs->where('name', 'like', "%{$search}%"));
    })
    ->get()
    ->map(function ($eskul) {
        $schedules = $eskul->absensiEskul
            ->filter(fn($a) => $a->is_recurring)
            ->map(fn($a) => [
                'day_of_week' => (int) $a->day_of_week,
                'jam_mulai' => $a->jam_mulai,
                'jam_selesai' => $a->jam_selesai,
            ])->values()->toArray();

        return [
            'id' => $eskul->id,
            'nama' => $eskul->nama,
            'schedules' => $schedules,
            'siswa' => $eskul->siswa()->with('kelas')->paginate(5)->toArray(),
        ];
    });



    //  modal AddAnggota
    $allUsers = User::where('role', 'murid') 
    ->with('kelas')
    ->withCount('eskuls')
    ->get()
    ->map(fn($u) => [
        'id' => $u->id,
        'name' => $u->name,
        'kelas' => $u->kelas ? ['id' => $u->kelas->id, 'name' => $u->kelas->name] : null,
        'eskuls_count' => $u->eskuls_count,
        'eskuls_ids' => $u->eskuls()->pluck('eskuls.id'),
    ]);


    $kelasList = \App\Models\Kelas::select('id', 'name')->get();

    $eskulsSimple = Eskul::select('id', 'nama')->get();

    return Inertia::render('Admin/AdminEskul', [
        'eskuls' => $eskuls,
        'filters' => ['search' => $search],
        'allUsers' => $allUsers,
        'kelasList' => $kelasList,
        'eskulsList' => $eskulsSimple,
    ]);
}


    public function show($id)
    {
        $eskul = Eskul::with([
            'siswa.kelas',
            'absensiEskul.kehadiran.user',
        ])->findOrFail($id);

        // Format jadwal untuk frontend
        $schedules = $eskul->absensiEskul
            ->filter(fn($a) => $a->is_recurring)
            ->map(fn($a) => [
                'day_of_week' => (int) $a->day_of_week,
                'jam_mulai' => $a->jam_mulai,
                'jam_selesai' => $a->jam_selesai,
            ])->values()->toArray();

        return Inertia::render('Admin/AdminEskulDetail', [
            'eskul' => [
                'id' => $eskul->id,
                'nama' => $eskul->nama,
                'schedules' => $schedules,
                'siswa' => $eskul->siswa()->with('kelas')->paginate(5),
                'absensiEskul' => $eskul->absensiEskul,
            ],
        ]);
    }

    public function update(Request $request, $id)
    {
        $eskul = Eskul::findOrFail($id);

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'schedules' => 'array',
            'schedules.*.day_of_week' => 'required|integer',
            'schedules.*.jam_mulai' => 'required|string',
            'schedules.*.jam_selesai' => 'required|string',
        ]);

        DB::transaction(function () use ($eskul, $validated) {
            $eskul->update(['nama' => $validated['nama']]);

            // Hapus jadwal lama
            $eskul->absensiEskul()->where('is_recurring', true)->delete();

            // Tambah jadwal baru
            foreach ($validated['schedules'] ?? [] as $s) {
                $eskul->absensiEskul()->create([
                    'day_of_week' => $s['day_of_week'],
                    'jam_mulai' => $s['jam_mulai'],
                    'jam_selesai' => $s['jam_selesai'],
                    'is_recurring' => true,
                ]);
            }
        });

        return redirect()->back()->with('success', 'Data eskul berhasil diperbarui.');
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

        
        $allUserIds = collect($data['selections'])->flatMap(fn($s) => $s['user_ids'])->unique()->values()->all();

        
        $userNewCounts = [];
        foreach ($allUserIds as $uid) $userNewCounts[$uid] = 0;

        foreach ($data['selections'] as $sel) {
            $uniqueUserIds = array_values(array_unique($sel['user_ids']));
            foreach ($uniqueUserIds as $u) {
                $userNewCounts[$u] = ($userNewCounts[$u] ?? 0) + 1;
            }
        }

        
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

        
        DB::beginTransaction();
        try {
            foreach ($data['selections'] as $sel) {
                $eskul = Eskul::find($sel['eskul_id']);
                if (!$eskul) continue;

                
                $eskul->siswa()->syncWithoutDetaching(array_values(array_unique($sel['user_ids'])));
            }

           
            foreach ($allUserIds as $uid) {
                $user = User::find($uid);
                if (!$user) continue;

               
                $user->load('eskuls');
                $eskulIds = $user->eskuls()->pluck('eskuls.id')->toArray();

               
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





    public function destroy(Eskul $eskul)
{
    DB::transaction(function () use ($eskul) {
       
        User::where('eskul_siswa1_id', $eskul->id)->update(['eskul_siswa1_id' => null]);
        User::where('eskul_siswa2_id', $eskul->id)->update(['eskul_siswa2_id' => null]);
        User::where('eskul_siswa3_id', $eskul->id)->update(['eskul_siswa3_id' => null]);

       
        $eskul->siswa()->detach();
        $eskul->absensiEskul()->delete();

        
        $eskul->delete();
    });

    return redirect()->route('admin.eskul.index')->with('success', 'Eskul berhasil dihapus');
}


    public function removeMember(Request $request, Eskul $eskul)
{
    $userId = $request->input('user_id');
    $user = \App\Models\User::findOrFail($userId);

    
    $eskul->siswa()->detach($userId);

    
    $columns = ['eskul_siswa1_id', 'eskul_siswa2_id', 'eskul_siswa3_id'];
    foreach ($columns as $col) {
        if ($user->$col === $eskul->id) {
            $user->update([$col => null]);
            break;
        }
    }

    return redirect()->route('admin.eskul.index')->with('success', 'member berhasil dihapus');
    
}

}
