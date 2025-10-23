<?php

// app/Http/Controllers/EskulController.php
namespace App\Http\Controllers;

use App\Models\AbsensiEskul;
use App\Models\KehadiranEskul;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use illuminate\Support\Str;

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


public function submitKehadiran(Request $request, AbsensiEskul $absensi)
    {
        try {
            // LOG: debugging detail request
            Log::info('📸 Data kehadiran diterima (debug):', [
                'user' => Auth::id(),
                'absensi_id' => $absensi->id,
                'status' => $request->input('status'),
                'content_type' => $request->headers->get('content-type'),
                'all_inputs' => $request->all(), // hati-hati di prod (berisi banyak data)
                '_FILES' => $_FILES,
                'hasFile' => $request->hasFile('foto'),
                'foto_original_name' => $request->file('foto') ? $request->file('foto')->getClientOriginalName() : null,
                'upload_max_filesize' => ini_get('upload_max_filesize'),
                'post_max_size' => ini_get('post_max_size'),
                'memory_limit' => ini_get('memory_limit'),
            ]);

            // Validasi status dulu
            $request->validate([
                'status' => 'required|in:Hadir,Tidak Hadir',
            ]);

            // Kalau Hadir, pastikan ada file atau ada input foto (base64)
            if ($request->input('status') === 'Hadir') {
                if (! $request->hasFile('foto') && ! $request->filled('foto')) {
                    Log::warning('Foto tidak ditemukan pada request saat status=Hadir', [
                        'hasFile' => $request->hasFile('foto'),
                        'filled_foto' => $request->filled('foto'),
                    ]);
                    return response()->json(['error' => 'Foto tidak ditemukan pada request'], 422);
                }
            }

            $fotoBase64 = null;

            // 1) jika ada file upload
            if ($request->hasFile('foto')) {
                $file = $request->file('foto');

                if (! $file->isValid()) {
                    throw new \Exception('Uploaded file is not valid');
                }

                // Optional: log ukuran file
                Log::info('Upload file info', [
                    'originalName' => $file->getClientOriginalName(),
                    'mimeType' => $file->getClientMimeType(),
                    'sizeBytes' => $file->getSize(),
                ]);

                // Jika ukuran terlalu besar, log & lanjut (validator sebelumnya bisa menolak)
                if ($file->getSize() > (5 * 1024 * 1024)) {
                    Log::warning('File lebih besar dari 5MB', ['size' => $file->getSize()]);
                }

                $fotoBase64 = base64_encode(file_get_contents($file->getRealPath()));
            }
            // 2) fallback: jika frontend mengirim base64 string di field 'foto'
            elseif ($request->filled('foto')) {
                $fotoInput = $request->input('foto');

                // Jika data URL (data:image/png;base64,....)
                if (Str::startsWith($fotoInput, 'data:image')) {
                    $parts = explode(',', $fotoInput);
                    $fotoBase64 = $parts[1] ?? null;
                } else {
                    // Mungkin raw base64 string tanpa data URI
                    $fotoBase64 = $fotoInput;
                }

                // validate minimal length
                if (! $fotoBase64 || strlen($fotoBase64) < 50) {
                    Log::warning('Base64 foto terlalu pendek atau tidak valid', ['len' => strlen((string)$fotoBase64)]);
                    return response()->json(['error' => 'Foto base64 tidak valid'], 422);
                }
            }

            // Simpan ke DB (sama seperti sebelumnya menyimpan base64)
            KehadiranEskul::create([
                'absensi_eskul_id' => $absensi->id,
                'user_id'          => Auth::id(),
                'tanggal'          => now()->toDateString(),
                'jam_absen'        => now()->format('H:i:s'),
                'status'           => $request->input('status'),
                'foto'             => $fotoBase64,
            ]);

            Log::info('✅ Kehadiran tersimpan', [
                'user' => Auth::id(),
                'absensi_id' => $absensi->id,
            ]);

            return response()->json(['success' => true], 200);
        } catch (\Throwable $e) {
            Log::error('❌ Error submit kehadiran (exception):', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['error' => 'Server error: '.$e->getMessage()], 500);
        }
    }

}