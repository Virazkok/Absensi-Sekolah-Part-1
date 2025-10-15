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

    $request->validate([
        'nis' => 'nullable|integer|max:50',
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email,' . $user->id,
        'username' => 'nullable|string|unique:users,username,' . $user->id,
        'kelas_id' => 'nullable|exists:kelas,id',
        'role' => 'required|string',
        'status' => 'nullable|string',
        'password' => 'nullable|min:6',
        'avatar' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        'eskul_ids' => 'array',
    ]);

    // isi field user, kecuali nis & avatar
    $user->fill($request->except('password','avatar','eskul_ids','nis'));

    if ($request->filled('password')) {
        $user->password = Hash::make($request->password);
    }

    // handle avatar
    if ($request->hasFile('avatar')) {
        $image = $request->file('avatar');
        $base64 = 'data:image/' . $image->getClientOriginalExtension() . ';base64,' . base64_encode(file_get_contents($image));
        $user->avatar = $base64;
    }

    $user->save();

    // update nis di tabel murid
    if ($user->murid) {
        $user->murid->update([
            'nis' => $request->nis,
            'nama' => $request->name,
            'kelas_id' => $request->kelas_id,
        ]);
    }

    // sinkronisasi eskul
    if ($request->has('eskul_ids')) {
        $user->eskuls()->sync($request->eskul_ids);
    }

    return redirect()->route('admin.user.detail', $user->id)
        ->with('success', 'User updated successfully');
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
