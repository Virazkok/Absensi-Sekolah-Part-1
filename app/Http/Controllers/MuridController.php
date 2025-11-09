<?php

namespace App\Http\Controllers;

use App\Models\Murid;
use App\Models\Kelas;
use Illuminate\Http\Request;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Auth;
use inertia\Inertia;
use Illuminate\Support\Str;
use Carbon\Carbon;

class MuridController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index(Request $request) {
    $user = Auth::user();

    $murid = Murid::where('user_id', $user->id)->first();

    if (!$murid) {
        return redirect()->back()->withErrors(['msg' => 'Data murid tidak ditemukan.']);
    }

    $token = Str::random(32);
    $expiresAt = Carbon::now()->addSeconds(20);

    $murid->update([
        'qr_token' => $token,
        'token_expired_at' => $expiresAt,
    ]);

    $qrData = json_encode([
        'murid_id' => $murid->id,
        'nama' => $user->name,
        'kelas' => $murid->kelas->name ?? 'Tidak ada kelas',
        'timestamp' => now()->toDateTimeString(),
        'token' => $token,
    ]);

    $qrCode = (string) QrCode::size(300)->generate($qrData);
    $mode = $request->query('mode', 'in');

    return Inertia::render('Murid/checkQrSiswa', [
        'qrCode' => $qrCode,
        'auth' => ['user' => $user],
        'mode' => $mode, 
    ]);
}

    public function dashboard()
{
    $user = Auth::user();

    // Ambil data murid berdasarkan user login
    $murid = Murid::where('user_id', $user->id)->first();

    if (!$murid) {
        return redirect()->back()->withErrors(['msg' => 'Data murid tidak ditemukan.']);
    }
    return Inertia::render('Murid/homeSiswa', [
        'auth' => ['user' => $user],
    ]);
}

public function generateQrCode(Request $request)
{
   $user = Auth::user();
    
    if (!$user) {
        return response()->json(['error' => 'Unauthenticated'], 401);
    }

    $murid = Murid::where('user_id', $user->id)->first();

    if (!$murid) {
        return response()->json(['error' => 'Student not found'], 404);
    }                    
    $murid = Murid::where('user_id', $user->id)->first();

    if (!$murid) {
        return response()->json(['qrCode' => null], 404);
    }
    $token     = Str::random(32);
    $expiresAt = Carbon::now()->addSeconds(20);

    $murid->update([
        'qr_token'        => $token,
        'token_expired_at'=> $expiresAt,
    ]);
    $payload = json_encode([
        'murid_id'  => $murid->id,
        'nama'      => $user->name,
        'kelas'     => optional($murid->kelas)->name ?? 'Tidak ada kelas',
        'timestamp' => now()->toDateTimeString(),
        'token'     => $token,
    ]);
    QrCode::format('svg');

    $qrSvg = QrCode::size(300)->generate($payload);

    return response()->json([
        'qrCode' => $qrSvg,
        'token'  => $token
    ]);
}
}
