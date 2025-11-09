<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Murid;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class RegisterController extends Controller
{
   public function store(Request $request)
{
    $validated = $request->validate([
        'name'      => 'required|string|max:255',
        'username'  => 'required|string|max:255|unique:users',
        'email'     => 'required|string|email|max:255|unique:users',
        'password'  => 'required|string|min:8|',
        'kelas_id'  => 'required|integer|exists:kelas,id',
        'nis'       => 'required|string|unique:murid,nis',
        'keahlian'  => 'nullable|string|max:255',
        
    ]);


    $murid = Murid::create([
        'nis'      => $validated['nis'],
        'nama'     => $validated['name'],
        'email'    => $validated['email'],
        'kelas_id' => $validated['kelas_id'],
        'keahlian' => $validated['keahlian'] ?? null,
        'qr_token' => Str::uuid(),
    ]);


    $user = User::create([
        'name'     => $validated['name'],
        'username' => $validated['username'],
        'email'    => $validated['email'],
        'password' => Hash::make($validated['password']),
        'kelas_id' => $validated['kelas_id'],
        'keahlian' => $validated['keahlian'] ?? null,
        'nis'      => $murid->nis,   // 🔑 sinkron dari murid
        'role'     => 'murid',
        'status'   => 'active',
        'eskul_siswa1_id' => $validated['eskul_siswa1_id'] ?? null,
        'eskul_siswa2_id' => $validated['eskul_siswa2_id'] ?? null,
        'eskul_siswa3_id' => $validated['eskul_siswa3_id'] ?? null,
    ]);


    $murid->update([
        'user_id' => $user->id
    ]);

    $eskulIds = array_filter([
        $validated['eskul_siswa1_id'] ?? null,
        $validated['eskul_siswa2_id'] ?? null,
        $validated['eskul_siswa3_id'] ?? null,
    ]);
    if (!empty($eskulIds)) {
        $murid->eskuls()->attach($eskulIds);
    }

    return response()->json([
        'message' => 'Registrasi berhasil',
        'user'    => $user,
        'murid'   => $murid
    ]);
}


}
