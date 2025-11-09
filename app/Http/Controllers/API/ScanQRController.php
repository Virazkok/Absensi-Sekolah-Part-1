<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Murid;
use App\Models\EventAttendance;
use App\Models\EventRegistration;
use App\Models\Event;
use App\Models\Kehadiran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

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

     public function scanEvent(Request $request)
{
    $qrData = $request->all();
    if (isset($qrData['qr_data']) && is_string($qrData['qr_data'])) {
        $decoded = json_decode($qrData['qr_data'], true);
        if (json_last_error() === JSON_ERROR_NONE) {
            $qrData = $decoded;
        }
    }
    Log::info('scanEvent called, payload:', $qrData);

    if (!is_array($qrData) || !isset($qrData['event_id']) || !isset($qrData['qr_token']) || !isset($qrData['user_id'])) {
        Log::warning('scanEvent invalid payload', ['payload' => $qrData]);
        return response()->json(['message' => 'Format QR tidak valid'], 400);
    }

    $registration = EventRegistration::where('event_id', $qrData['event_id'])
        ->where('user_id', $qrData['user_id'])
        ->where('qr_token', $qrData['qr_token'])
        ->first();

    if (!$registration) {
        Log::warning('scanEvent registration not found', ['payload' => $qrData]);
        return response()->json(['message' => 'Data tidak ditemukan'], 404);
    }

    $muridId = $registration->murid_id ?? $registration->user_id;

    DB::beginTransaction();
    try {
        $already = EventAttendance::where('registration_id', $registration->id)
            ->whereDate('attended_at', Carbon::today())
            ->first();

        if ($already) {
            DB::commit();
            Log::info('scanEvent already attended', ['registration_id' => $registration->id, 'attendance_id' => $already->id]);
            return response()->json([
                'message' => 'Peserta sudah melakukan scan hari ini',
                'registration' => $registration,
                'attendance' => $already,
            ]);
        }
        $attendance = EventAttendance::create([
            'registration_id' => $registration->id,
            'event_id'        => $registration->event_id,
            'murid_id'        => $muridId,
            'attended_at'     => now(),
        ]);

        DB::commit();
        Log::info('scanEvent saved attendance', ['attendance' => $attendance->toArray()]);

        return response()->json([
            'message' => 'Scan berhasil dan kehadiran dicatat!',
            'registration' => $registration,
            'attendance' => $attendance,
        ]);
    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('scanEvent save failed: ' . $e->getMessage(), ['exception' => $e]);
        return response()->json(['message' => 'Gagal mencatat kehadiran', 'error' => $e->getMessage()], 500);
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
