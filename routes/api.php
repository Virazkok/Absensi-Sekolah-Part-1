<?php

use App\Http\Controllers\API\ScanQRController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\MuridController;
use App\Http\Controllers\API\ApiMuridProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\API\AttendanceController;
use App\Http\Controllers\API\QrTokenController;
use App\Models\Murid;
use App\Http\Controllers\Api\RiwayatController;
use \App\Http\Controllers\Api\EskulListController;


use App\Http\Controllers\Api\StatistikController;
use App\Http\Controllers\KehadiranController;

use App\Http\Controllers\Api\LaporanController;
// routes/api.php
use App\Models\Kelas;
use App\Models\Event;
use App\Models\Eskul;
use App\Models\User;
use App\Http\Controllers\Orangtua\OrangTuaGuruController;

use App\Http\Controllers\Api\ApiMuridOverviewController;


use App\Http\Controllers\API\EditProfileOrtuGuruController;
use App\Http\Controllers\Admin\AdminRiwayatKehadiranController;
use App\Http\Controllers\Api\AdminRekapDashboardController;
use App\Http\Controllers\Api\AdminDashboardStatistikController;
use App\Http\Controllers\Api\AdminDashboardReportController;

Route::prefix('admin/dashboard')->group(function () {
    Route::get('/report', [AdminDashboardReportController::class, 'index']);
});

Route::get('/stats/event-summary', [StatistikController::class, 'eventSummary']);

Route::prefix('admin')->group(function () {
    Route::prefix('dashboard')->group(function () {
        Route::get('/statistik', [AdminDashboardStatistikController::class, 'index']);
    });
});


Route::get('/admin/rekap-kehadiran', [AdminRekapDashboardController::class, 'index']);


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/admin/riwayat-kehadiran', [AdminRiwayatKehadiranController::class, 'index']);
});


Route::middleware('auth:sanctum')->group(function () {
    // Profile Ortu / Guru
    Route::get('/parent/me', [EditProfileOrtuGuruController::class, 'me']);
    Route::post('/parent/update-profile', [EditProfileOrtuGuruController::class, 'updateProfile']);
});


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/student/overview', [ApiMuridOverviewController::class, 'index']);
    Route::get('/student/eskuls', function () {
        $user = Auth::user();

        $eskulIds = array_filter([
            $user->eskul_siswa1_id,
            $user->eskul_siswa2_id,
            $user->eskul_siswa3_id,
        ]);

        return \App\Models\Eskul::whereIn('id', $eskulIds)->select('id', 'nama')->get();
    });
});



Route::get('/riwayat-kehadiran', [OrangTuaGuruController::class, 'attendanceHistory']);

Route::get('/event/list', function () {
    return Event::all(['id', 'title']);
});
Route::get('/eskul/list', fn() => Eskul::all(['id', 'nama as nama']));

Route::get('/kelas/list', function () {
    return Kelas::all(['id', 'name as nama']);
});


Route::prefix('laporan')->group(function () {
    Route::get('/sekolah', [LaporanController::class, 'sekolah']);
    Route::get('/eskul', [LaporanController::class, 'eskul']);
    Route::get('/event', [LaporanController::class, 'event']);
    Route::get('/{type}/export', [LaporanController::class, 'export']);
});


Route::post('/kehadiran/auto-checkout', [KehadiranController::class, 'autoCheckout']);
Route::get('/eskul/list', [EskulListController::class, 'list']);


Route::prefix('stats')->group(function () {
    Route::get('/sekolah', [StatistikController::class, 'sekolah']);
    Route::get('/eskul', [StatistikController::class, 'eskul']);
    Route::get('/event', [StatistikController::class, 'event']);
});


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/student/me', [ApiMuridProfileController::class, 'me']);
    Route::post('/student/update-profile', [ApiMuridProfileController::class, 'updateProfile']);
});


Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/riwayat', [RiwayatController::class, 'index']);
});
Route::middleware('auth:sanctum')->get('/riwayat', [RiwayatController::class, 'index']);

Route::post('/events/scan-qr', [ScanQRController::class, 'scanEvent'])
    ->name('events.scan-qr');
    
Route::post('/scan-qr/check-in', [ScanQRController::class, 'scan']);
Route::post('/scan-qr/check-out', [ScanQRController::class, 'scanCheckOut']);

Route::middleware(['auth', 'verified'])
     ->get('/generate-qr', [MuridController::class, 'generateQrCode']);
    Route::get('/murid', function () {
        return Murid::with('kelas')->get();
    });
    
    Route::get('/kehadiran', function () {
        return \App\Models\Kehadiran::with(['murid', 'kelas'])->get();
    });
    
    Route::get('/class-attendances/{classId}', function ($classId) {
        return \App\Models\Kehadiran::with('murid')
            ->where('kelas_id', $classId)
            ->get();
    });
    Route::get('/kelas', function() {
    return \App\Models\Kelas::all();
});
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/events', [EventController::class, 'index']);
    Route::post('/events', [EventController::class, 'store']);
    Route::post('/events/register', [EventController::class, 'register']);
    Route::post('/events/{id}/generate-qr', [EventController::class, 'generateQR']);
    Route::post('/events/{id}/publish', [EventController::class, 'updatePublishStatus']);
    Route::get('/event-registrations', function (Request $request) {
    return $request->user()->eventRegistrations;
    });
});
Route::middleware('auth:sanctum')->group(function () {
    Route::patch('/events/{id}/publish', [EventController::class, 'updatePublishStatus']);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::get('/eskuls', function() {
    return \App\Models\Eskul::all();
});
