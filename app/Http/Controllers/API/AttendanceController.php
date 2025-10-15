<?php

// app/Http/Controllers/API/AttendanceController.php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Kehadiran;
use App\Models\Murid;
use Illuminate\Support\Facades\Cache;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Str;
class AttendanceController extends Controller
{
    // Generate QR Code untuk siswa
    public function generateQr($studentId)
    {
        $student = Murid::findOrFail($studentId);
        
        // Buat token dinamis yang berlaku 20 detik
        $dynamicToken = Str::random(32);
        Cache::put('qr_token_'.$dynamicToken, $student->id, 20);
        
        $qrData = json_encode([
            'student_id' => $student->id,
            'token' => $dynamicToken,
            'expires_at' => now()->addSeconds(20)->timestamp
        ]);
        
        $qrCode = QrCode::size(200)->generate($qrData);
        
        return response()->json([
            'qr_code' => $qrCode,
            'expires_in' => 20
        ]);
    }
    
    // Scan QR Code oleh guru
    public function scanQr(Request $request)
    {
        $request->validate([
            'qr_data' => 'required|string'
        ]);
        
        try {
            $qrData = json_decode($request->qr_data, true);
            
            if (!isset($qrData['token']) || !Cache::has('qr_token_'.$qrData['token'])) {
                return response()->json(['error' => 'QR Code tidak valid atau sudah kadaluarsa'], 400);
            }
            
            $studentId = Cache::get('qr_token_'.$qrData['token']);
            $student = Murid::findOrFail($studentId);
            
            // Catat absensi
            $attendance = Kehadiran::create([
                'student_id' => $student->id,
                'class_id' => $student->class_id,
                'date' => now()->toDateString(),
                'time_in' => now()->toTimeString(),
                'status' => $this->getAttendanceStatus()
            ]);
            
            // Hapus token setelah digunakan
            Cache::forget('qr_token_'.$qrData['token']);
            
            return response()->json([
                'message' => 'Absensi berhasil dicatat',
                'student' => $student,
                'attendance' => $attendance
            ]);
            
        } catch (\Exception $e) {
            return response()->json(['error' => 'Terjadi kesalahan: '.$e->getMessage()], 500);
        }
    }
    
    private function getAttendanceStatus()
    {
        $currentTime = now();
        $lateThreshold = '07:30:00'; // Contoh batas terlambat
        
        return $currentTime->toTimeString() > $lateThreshold ? 'late' : 'present';
    }
}