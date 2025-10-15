<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Murid;
use App\Models\Kehadiran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ScanQRController extends Controller
{
    public function scan(Request $request)
    {
        try {
            $data = $request->input('qr_data');

            if (!is_array($data) || !isset($data['token']) || !isset($data['murid_id'])) {
                return response()->json(['message' => 'Format QR tidak valid.'], 400);
            }

            $murid = Murid::with('kelas')
                ->where('id', $data['murid_id'])
                ->where('qr_token', $data['token'])
                ->first();

            if (!$murid) {
                return response()->json(['message' => 'QR Code tidak valid.'], 404);
            }

            $presensi = Kehadiran::where('murid_id', $murid->id)
                ->whereDate('tanggal', now())
                ->first();

            // Jika sudah ada presensi hari ini, jangan buat baru
            if ($presensi) {
                return response()->json([
                    'message' => 'Murid sudah Check In.',
                    'student' => $murid,
                    'status'  => $presensi->kehadiran,
                    'jam_masuk' => $presensi->jam_masuk,
                    'jam_keluar' => $presensi->jam_keluar,
                ]);
            }

            $jamTerlambat = "12:00:00";
            $status = now()->toTimeString() > $jamTerlambat ? "Terlambat" : "Hadir";

            $kehadiran = Kehadiran::create([
                'murid_id'   => $murid->id,
                'kelas_id'   => $murid->kelas_id,
                'tanggal'    => now()->toDateString(),
                'jam_masuk'  => now()->toTimeString(),
                'kehadiran'  => $status,
            ]);

            return response()->json([
                'message' => 'Absensi Check In berhasil dicatat!',
                'student' => $murid,
                'status'  => $kehadiran->kehadiran,
                'jam_masuk' => $kehadiran->jam_masuk,
                'jam_keluar' => $kehadiran->jam_keluar,
            ]);

        } catch (\Exception $e) {
            Log::error('Scan CheckIn error: '.$e->getMessage());

            return response()->json([
                'message' => 'Terjadi kesalahan saat Check In.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function scanCheckOut(Request $request)
    {
        try {
            $data = $request->input('qr_data');

            if (!is_array($data) || !isset($data['token']) || !isset($data['murid_id'])) {
                return response()->json(['message' => 'Format QR tidak valid.'], 400);
            }

            $murid = Murid::with('kelas')
                ->where('id', $data['murid_id'])
                ->where('qr_token', $data['token'])
                ->first();

            if (!$murid) {
                return response()->json(['message' => 'QR Code tidak valid.'], 404);
            }

            $presensi = Kehadiran::where('murid_id', $murid->id)
                ->whereDate('tanggal', now())
                ->first();

            if (!$presensi) {
                return response()->json(['message' => 'Belum ada data Check In hari ini'], 404);
            }

            if ($presensi->jam_keluar) {
                return response()->json([
                    'message' => 'Murid sudah Check Out.',
                    'student' => $murid,
                    'jam_masuk' => $presensi->jam_masuk,
                    'jam_keluar' => $presensi->jam_keluar,
                ]);
            }

            // Update jam_keluar
           // Update jam_keluar
            $presensi->update([
                'jam_keluar' => now()->toTimeString(),
            ]);

            $presensi->refresh();

            return response()->json([
                'message' => 'Check Out berhasil dicatat!',
                'student' => $murid,
                'status' => $presensi->kehadiran,
                'jam_masuk' => $presensi->jam_masuk,
                'jam_keluar' => $presensi->jam_keluar,
            ]);


        } catch (\Exception $e) {
            Log::error('Scan CheckOut error: '.$e->getMessage());

            return response()->json([
                'message' => 'Terjadi kesalahan saat mencatat Check Out.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
