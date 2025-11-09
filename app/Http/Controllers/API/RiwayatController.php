<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use App\Models\Kehadiran;
use App\Models\KehadiranEskul;
use App\Models\EventKehadiran;

class RiwayatController extends Controller
{
    public function index(Request $request)
    {
        try {
            
            $user = Auth::user()->load('murid');

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated',
                    'data' => []
                ], 401);
            }

            $type = $request->query('type', 'sekolah');
            $mode = $request->query('mode', 'weekly');
            $week = $request->query('week', 0);
            $month = $request->query('month', Carbon::now()->month);
            $year = $request->query('year', Carbon::now()->year);

            Log::info('Riwayat request', [
                'type' => $type, 
                'mode' => $mode, 
                'week' => $week,
                'month' => $month,
                'year' => $year,
                'user_id' => $user->id
            ]);

            $data = [];

            switch ($type) {
                case 'sekolah':
                    $data = $this->getRiwayatSekolah($user, $mode, $week, $month, $year);
                    break;

                case 'eskul':
                    $data = $this->getRiwayatEskul($user, $mode, $week, $month, $year);
                    break;

                case 'event':
                    $data = $this->getRiwayatEvent($user);
                    break;

                default:
                    $data = [];
                    break;
            }

            return response()->json([
                'success' => true,
                'data' => $data,
                'summary' => $this->getSummary($type, $user, $mode, $week, $month, $year)
            ]);

        } catch (\Exception $e) {
            Log::error('Riwayat error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage(),
                'data' => []
            ], 500);
        }
    }

   private function getRiwayatSekolah($user, $mode, $week, $month, $year)
{
    $query = Kehadiran::where('murid_id', $user->id);
    $this->applyDateFilter($query, $mode, 'tanggal', $week, $month, $year);

    return $query->orderBy('tanggal', 'desc')
        ->orderBy('jam_masuk', 'desc')
        ->get()
        ->map(fn($item) => [
            'id' => $item->id,
            'tanggal' => $item->tanggal,
            'jam_masuk' => $item->jam_masuk ?? '-',
            'jam_keluar' => $item->jam_keluar ?? '-',
            'kehadiran' => $item->kehadiran ?? 'unknown'
        ]);
}

private function getRiwayatEskul($user, $mode, $week, $month, $year)
{
    $query = KehadiranEskul::where('user_id', $user->id)
        ->with(['absensi.eskul']);

    $this->applyDateFilter($query, $mode, 'tanggal', $week, $month, $year);

    return $query->orderBy('tanggal', 'desc')
        ->orderBy('jam_absen', 'desc')
        ->get()
        ->map(function($item) {
            return [
                'id' => $item->id,
                'tanggal' => $item->tanggal, 
                'status' => $item->status ?? 'unknown',
                'eskul_name' => $item->absensi->eskul->nama ?? 'Eskul Tidak Diketahui'
            ];
        });
}

private function getRiwayatEvent($user)
{
    $muridId = $user->murid ? $user->murid->id : null;
    if (!$muridId) return [];

    $query = EventKehadiran::where('murid_id', $muridId)
        ->with('event');

    return $query->orderBy('attended_at', 'desc')
        ->get()
        ->map(fn($item) => [
            'id' => $item->id,
            'tanggal' => $item->attended_at ? $item->attended_at->format('Y-m-d') : 'N/A',
            'event_name' => $item->event->title ?? 'Event',
            'status' => $item->status ?? 'unknown'
        ]);
}

  private function applyDateFilter($query, $mode, $dateColumn = 'tanggal', $week = 0, $month = null, $year = null)
{
   
    $week = (int)$week;
    $month = $month !== null ? (int)$month : null;
    $year = $year !== null ? (int)$year : null;

    $now = Carbon::now();
    Log::info('Current date: ' . $now->format('Y-m-d'));

    switch ($mode) {
        case 'weekly':
            Log::info('Weekly mode, week offset: ' . $week);
            $start = $now->copy()->startOfWeek();
            if ($week !== 0) {
                $start->addWeeks($week);
            }
            
            $end = $start->copy()->endOfWeek();
            
            Log::info('Week range: ' . $start->format('Y-m-d') . ' to ' . $end->format('Y-m-d'));
            break;
            
        case 'monthly':
            Log::info('Monthly mode, month: ' . $month . ', year: ' . $year);
            $month = $month ?: $now->month;
            $year = $year ?: $now->year;
            if ($month < 1 || $month > 12) {
                $month = $now->month;
            }
            if ($year < 2000 || $year > 2100) {
                $year = $now->year;
            }
            
            $start = Carbon::createFromDate($year, $month, 1)->startOfMonth();
            $end = $start->copy()->endOfMonth();
            
            Log::info('Month range: ' . $start->format('Y-m-d') . ' to ' . $end->format('Y-m-d'));
            break;
            
        case 'range':
            $start = $now->copy()->subDays(30);
            $end = $now;
            break;
            
        default:
            $start = $now->copy()->startOfWeek();
            $end = $now->copy()->endOfWeek();
            break;
    }

    Log::info('Final filter range: ' . $start->format('Y-m-d') . ' to ' . $end->format('Y-m-d'));

    $query->whereBetween($dateColumn, [$start->format('Y-m-d'), $end->format('Y-m-d')]);
}

    private function getSummary($type, $user, $mode, $week, $month, $year)
    {
        switch ($type) {
            case 'sekolah':
                $query = Kehadiran::where('murid_id', $user->id);
                $this->applyDateFilter($query, $mode, 'tanggal', $week, $month, $year);
                return [
                    'hadir' => (clone $query)->where('kehadiran', 'hadir')->count(),
                    'absen' => (clone $query)->where('kehadiran', 'absen')->count(),
                    'terlambat' => (clone $query)->where('kehadiran', 'terlambat')->count(),
                ];

            case 'eskul':
                $query = KehadiranEskul::where('user_id', $user->id);
                $this->applyDateFilter($query, $mode, 'tanggal', $week, $month, $year);
                return [
                    'hadir' => (clone $query)->where('status', 'hadir')->count(),
                    'absen' => (clone $query)->where('status', 'absen')->count(),
                    'total' => (clone $query)->count(),
                ];

            case 'event':
                $muridId = $user->murid ? $user->murid->id : null;
                if (!$muridId) return ['ikut' => 0];

                $query = EventKehadiran::where('murid_id', $muridId);
                return [
                    'ikut' => $query->count()
                ];

            default:
                return [];
        }
    }
}