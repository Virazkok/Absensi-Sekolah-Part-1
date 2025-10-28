<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Murid;
use App\Models\Kelas;
use App\Models\Eskul;
use Illuminate\Support\Facades\Hash;

class UserManagementController extends Controller
{
    public function index()
    {
        $users = User::select('id','name','role','status','created_at')
            ->orderBy('created_at','desc')
            ->paginate(10);

        return Inertia::render('Admin/UserManagement', [
            'users' => $users
        ]);
    }

   public function detail($id)
{
    $user = User::with(['kelas', 'murid', 'eskuls'])->findOrFail($id);
    return Inertia::render('Admin/UserDetail', [
        'user' => $user
    ]);
}

public function edit($id)
{
    $user = User::with(['kelas', 'murid', 'eskuls'])->findOrFail($id);
    $kelas = Kelas::all();
    $eskuls = Eskul::all();

    return Inertia::render('Admin/UserEdit', [
        'user' => $user,
        'kelas' => $kelas,
        'eskuls' => $eskuls,
    ]);
}

public function update(Request $request, $id)
{
    $user = User::with('murid')->findOrFail($id);

    // 💡 Tentukan mode berdasarkan field yang dikirim
    $isBiodataUpdate = $request->has('kelas_id') && !$request->has('email');

    if ($isBiodataUpdate) {
        // === UPDATE BIODATA ===
        $request->validate([
            'name' => 'required|string|max:255',
            'nis' => 'required|string|max:50',
            'kelas_id' => 'required|exists:kelas,id',
            'kejuruan' => 'nullable|string|max:255',
        ]);

        // Update data di tabel murid
        if ($user->murid) {
            $user->murid->update([
                'nama' => $request->name,
                'nis' => $request->nis,
                'kelas_id' => $request->kelas_id,
                'keahlian' => $request->kejuruan,
            ]);
        }

        // Sinkron juga sebagian field user
        $user->update([
            'name' => $request->name,
            'kelas_id' => $request->kelas_id,
        ]);
    } else {
        // === UPDATE AKUN ===
$request->validate([
    'email' => 'required|email|unique:users,email,' . $user->id,
    'role' => 'required|string',
    'status' => 'nullable|string',
    'password' => 'nullable|min:6|confirmed',
    'eskul_ids' => 'array|nullable|max:3', // 👈 maksimal 3 eskul
    'eskul_ids.*' => 'integer|exists:eskuls,id',
]);

$user->fill($request->only('email', 'role', 'status'));

// jika password dikirim
if ($request->filled('password')) {
    $user->password = Hash::make($request->password);
}

// handle eskul (maksimal 3)
if ($request->has('eskul_ids')) {
    $eskulIds = array_pad($request->eskul_ids, 3, null); // isi kekurangan jadi null
    $user->eskul_siswa1_id = $eskulIds[0];
    $user->eskul_siswa2_id = $eskulIds[1];
    $user->eskul_siswa3_id = $eskulIds[2];
}

$user->save();


        // sinkronisasi eskul
        if ($request->has('eskul_ids')) {
            $user->eskuls()->sync($request->eskul_ids);
        }
    }

    return redirect()
        ->route('admin.user.detail', $user->id)
        ->with('success', 'Data user berhasil diperbarui.');
}



public function destroy($id)
{
    $user = User::findOrFail($id);
    $user->eskuls()->detach();
    if ($user->murid) {
        $user->murid->delete();
    }
    $user->delete();

    return redirect()->route('admin.user.management')->with('success', 'User berhasil dihapus');
}

}
