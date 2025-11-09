<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Murid;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
{
    $request->validate([
        'name' => 'required|string|max:255',
        'username' => 'nullable|string|max:255|unique:users',
        'email' => 'required|string|lowercase|email|max:255|unique:users',
        'password' => ['required', Rules\Password::defaults()],
        'kelas_id' => 'required|integer|exists:kelas,id',
        'nis' => 'required|string|unique:murid,nis',
        'keahlian' => 'nullable|string|max:255',
        'eskul_siswa1_id' => 'nullable|integer|exists:eskuls,id',
        'eskul_siswa2_id' => 'nullable|integer|exists:eskuls,id',
        'eskul_siswa3_id' => 'nullable|integer|exists:eskuls,id',
        'role' => 'required|string|max:255',
    ]);


    $murid = Murid::create([
        'nis' => $request->nis,
        'nama' => $request->name,
        'email' => $request->email,
        'kelas_id' => $request->kelas_id,
        'keahlian' => $request->keahlian,
        'qr_token' => null,
    ]);


    $user = User::create([
        'name' => $request->name,
        'username' => $request->username,
        'email' => $request->email,
        'password' => Hash::make($request->password),
        'kelas_id' => $request->kelas_id,
        'keahlian' => $request->keahlian,
        'nis' => $murid->id, 
        'eskul_siswa1_id' => $request->eskul_siswa1_id,
        'eskul_siswa2_id' => $request->eskul_siswa2_id,
        'eskul_siswa3_id' => $request->eskul_siswa3_id,
        'role' => $request->role,
        'status' => 'active',
    ]);

    // Update murid agar tau user_id
    $murid->update(['user_id' => $user->id]);

    return redirect()->intended(route('admin.user.management', absolute: false));
}


}
