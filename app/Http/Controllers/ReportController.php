<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Attendance;
use App\Models\ClassRoom;
use App\Models\Kehadiran;
use App\Models\Kelas;

class ReportController extends Controller
{
    public function index()
    {
        $attendances = Kehadiran::with(['murid', 'kelas'])->latest()->get();
        
        $classAttendances = [];
        $classes = Kelas::all();
        
        foreach ($classes as $class) {
            $classAttendances[$class->name] = Kehadiran::with('murid')
                ->where('kelas_id', $class->id)
                ->latest()
                ->get();
        }
        
        return Inertia::render('report', [
            'attendances' => $attendances,
            'classAttendances' => $classAttendances
        ]);
    }
}
