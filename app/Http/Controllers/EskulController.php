<?php

// app/Http/Controllers/EskulController.php
namespace App\Http\Controllers;

use App\Models\AbsensiEskul;
use App\Models\KehadiranEskul;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class EskulController extends Controller
{
    public function index()
{
    $user = Auth::user();
    $hariIni = now()->format('Y-m-d');
    $dayOfWeek = now()->dayOfWeek;

    $eskulIds = collect([
        $user->eskul_siswa1_id,
        $user->eskul_siswa2_id,
        $user->eskul_siswa3_id,
    ])->filter();

    $eskul = \App\Models\Eskul::whereIn('id', $eskulIds)->get();

    $absensiHariIni = AbsensiEskul::with(['kehadiran' => function($query) use ($user) {
        $query->where('user_id', $user->id)
              ->whereDate('tanggal', now()->toDateString());
    }])
    ->whereIn('eskul_id', $eskulIds)
    ->where(function ($q) use ($hariIni, $dayOfWeek) {
        $q->where('tanggal', $hariIni)
          ->orWhere('day_of_week', $dayOfWeek);
    })
    ->where('dipublish', true)
    ->get();

    return inertia('EskulMurid/AbsensiEskul', [
        'eskul' => $eskul,
        'absensiHariIni' => $absensiHariIni,
    ]);
}

    public function kehadiranPage(AbsensiEskul $absensi)
{
   $kehadiran = $absensi->kehadiran()
    ->where('user_id', Auth::id())
    ->whereDate('tanggal', now()->toDateString())
    ->first(['id', 'status', 'foto']); // Pastikan mengambil field status

    $user = Auth::user()->load('kelas');

    return inertia('EskulMurid/KehadiranEskul', [
        'absensi'   => $absensi,
        'kehadiran' => $kehadiran,
        'auth'      => [
            'user' => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'kelas' => $user->kelas ? $user->kelas->name : null,
            ]
        ]
    ]);
}


// app/Http/Controllers/EskulController.php
public function submitKehadiran(Request $request, AbsensiEskul $absensi)
{
    try {
        $request->validate([
            'status' => 'required|in:Hadir,Tidak Hadir',
        ]);

        $fotoPath = null;

        if ($request->input('status') === 'Hadir') {
            // Tangani upload file fisik
            if ($request->hasFile('foto')) {
                $file = $request->file('foto');
                $filename = 'kehadiran_' . Auth::id() . '_' . time() . '.' . $file->getClientOriginalExtension();
                $fotoPath = $file->storeAs('kehadiran_eskul', $filename, 'public');
            }
            // Tangani base64 string (fallback dari mobile)
            elseif ($request->filled('foto')) {
                $fotoInput = $request->input('foto');
                if (Str::startsWith($fotoInput, 'data:image')) {
                    $parts = explode(',', $fotoInput);
                    $decoded = base64_decode($parts[1] ?? '');
                    $filename = 'kehadiran_' . Auth::id() . '_' . time() . '.jpg';
                    $path = storage_path('app/public/kehadiran_eskul/' . $filename);
                    file_put_contents($path, $decoded);
                    $fotoPath = 'kehadiran_eskul/' . $filename;
                }
            }

            if (!$fotoPath) {
                return response()->json(['error' => 'Foto tidak ditemukan'], 422);
            }
        }

        KehadiranEskul::create([
            'absensi_eskul_id' => $absensi->id,
            'user_id'          => Auth::id(),
            'tanggal'          => now()->toDateString(),
            'jam_absen'        => now()->format('H:i:s'),
            'status'           => $request->input('status'),
            'foto'             => $fotoPath, // hanya path, bukan isi base64
        ]);

        return response()->json(['success' => true]);
    } catch (\Throwable $e) {
        Log::error('❌ Error submit kehadiran: '.$e->getMessage());
        return response()->json(['error' => 'Server error: '.$e->getMessage()], 500);
    }
}


}