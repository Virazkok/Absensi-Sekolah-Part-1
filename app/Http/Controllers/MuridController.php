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

        // Ambil data murid berdasarkan user login
        $murid = Murid::where('user_id', $user->id)->first();

        if (!$murid) {
            return redirect()->back()->withErrors(['msg' => 'Data murid tidak ditemukan.']);
        }

        // Generate token baru
        $token = Str::random(32);
        $expiresAt = Carbon::now()->addSeconds(20);

        // Simpan token ke database
        $murid->qr_token = $token;
        $murid->token_expired_at = $expiresAt;
        $murid->save();

        // Siapkan data QR code dalam bentuk JSON
        $qrData = json_encode([
            'murid_id' => $murid->id,
            'nama' => $user->name,
            'kelas' => $murid->kelas->name ?? 'Tidak ada kelas',
            'timestamp' => now()->toDateTimeString(),
            'token' => $token,
        ]);

        // Generate QR code SVG
        $qrCode = (string) QrCode::size(300)->generate($qrData);

        // Kirim ke React via Inertia
        return Inertia::render('Murid/checkQrSiswa', [
            'qrCode' => $qrCode,
            'auth' => ['user' => $user],
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

    // Kirim ke React via Inertia
    return Inertia::render('Murid/homeSiswa', [
        'auth' => ['user' => $user],
    ]);
}

// MuridController.php
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
    
    // user yg login
    $murid = Murid::where('user_id', $user->id)->first();

    if (!$murid) {
        return response()->json(['qrCode' => null], 404);
    }

    // token baru
    $token     = Str::random(32);
    $expiresAt = Carbon::now()->addSeconds(20);

    $murid->update([
        'qr_token'        => $token,
        'token_expired_at'=> $expiresAt,
    ]);

    // payload QR
    $payload = json_encode([
        'murid_id'  => $murid->id,
        'nama'      => $user->name,
        'kelas'     => optional($murid->kelas)->name ?? 'Tidak ada kelas',
        'timestamp' => now()->toDateTimeString(),
        'token'     => $token,
    ]);

    // QR SVG baru
    QrCode::format('svg');

    $qrSvg = QrCode::size(300)->generate($payload);

    return response()->json([
        'qrCode' => $qrSvg,
        'token'  => $token
    ]);
}


    // public function generateQrCode()
    // {
    // $user = Auth::user();
    
    // // Gabungkan data yang ingin diencode di QR
    // $qrData = json_encode([
    //     'murid_id' => $user->id,
    //     'nama' => $user->name,
    //     'kelas' => $user->class->name ?? 'Tidak ada kelas',
    //     'timestamp' => now()->toDateTimeString()
    // ]);

    // // Generate QR Code
    // $qrCode = QrCode::size(300)->generate($qrData);

    // return view('Murid/dashboard', compact('qrCode'));
    // }
    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Murid $murid)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Murid $murid)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Murid $murid)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Murid $murid)
    {
        //
    }
}
