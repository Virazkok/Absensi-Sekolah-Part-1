<?php

namespace App\Services;

use App\Models\Kehadiran;
use App\Models\KehadiranEskul;
use App\Models\EventKehadiran;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class RiwayatService
{
    /**
     * Ambil data Sekolah untuk rentang tanggal (tanpa pagination; biar controller yang gabungkan & paginate).
     * @return array{summary: array, rows: array<int, array>}
     */
    public static function getSekolahRange(int $muridId, string $start, string $end): array
    {
        $startDate = Carbon::parse($start)->toDateString();
        $endDate   = Carbon::parse($end)->toDateString();

        $summary = Kehadiran::where('murid_id', $muridId)
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->selectRaw("SUM(CASE WHEN kehadiran='hadir' THEN 1 ELSE 0 END) as hadir")
            ->selectRaw("SUM(CASE WHEN kehadiran='telat' THEN 1 ELSE 0 END) as telat")
            ->selectRaw("SUM(CASE WHEN kehadiran='alpa'  THEN 1 ELSE 0 END) as alpa")
            ->first();

        $rows = Kehadiran::where('murid_id', $muridId)
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->orderBy('tanggal', 'asc')
            ->get()
            ->map(function ($r) {
                $tanggal = method_exists($r, 'getAttribute') && $r->getAttribute('tanggal')
                    ? (string) (is_string($r->tanggal) ? $r->tanggal : $r->tanggal->format('Y-m-d'))
                    : null;
                return [
                    'id'         => $r->id,
                    'tanggal'    => $tanggal,
                    'jam_masuk'  => $r->jam_masuk,
                    'keterangan' => $r->kehadiran,
                    'kelas_id'   => $r->kelas_id,
                ];
            })->all();

        return [
            'summary' => [
                'hadir' => (int) ($summary->hadir ?? 0),
                'telat' => (int) ($summary->telat ?? 0),
                'alpa'  => (int) ($summary->alpa  ?? 0),
            ],
            'rows' => $rows,
        ];
    }

    /**
     * Ambil data Eskul untuk rentang tanggal (tanpa pagination).
     */
    public static function getEskulRange(int $userId, string $start, string $end): array
    {
        $startAt = Carbon::parse($start)->startOfDay();
        $endAt   = Carbon::parse($end)->endOfDay();

        $summary = KehadiranEskul::where('user_id', $userId)
            ->whereBetween('waktu_absen', [$startAt, $endAt])
            ->selectRaw("SUM(CASE WHEN status='hadir' THEN 1 ELSE 0 END) as hadir")
            ->selectRaw("SUM(CASE WHEN status='izin'  THEN 1 ELSE 0 END) as izin")
            ->selectRaw("SUM(CASE WHEN status='alpa'  THEN 1 ELSE 0 END) as alpa")
            ->first();

        $rows = KehadiranEskul::with('absensi')
            ->where('user_id', $userId)
            ->whereBetween('waktu_absen', [$startAt, $endAt])
            ->orderBy('waktu_absen', 'asc')
            ->get()
            ->map(function ($r) {
                return [
                    'id'          => $r->id,
                    'tanggal'     => Carbon::parse($r->waktu_absen)->toDateString(),
                    'waktu_absen' => Carbon::parse($r->waktu_absen)->toDateTimeString(),
                    'keterangan'  => $r->status,
                    'eskul'       => optional($r->absensi)->nama ?? null,
                ];
            })->all();

        return [
            'summary' => [
                'hadir' => (int) ($summary->hadir ?? 0),
                'izin'  => (int) ($summary->izin  ?? 0),
                'alpa'  => (int) ($summary->alpa  ?? 0),
            ],
            'rows' => $rows,
        ];
    }

    /**
     * Event: pagination di sini (tidak perlu weekly/monthly).
     * @return array{meta: array, summary: array, rows: array{data: array, pagination: array}}
     */
    public static function getEvent(int $userId, ?string $q = null, int $page = 1, int $perPage = 20): array
    {
        $query = EventKehadiran::with('event')
            ->where('user_id', $userId);

        if (!empty($q)) {
            $query->whereHas('event', function ($qb) use ($q) {
                $qb->where('name', 'like', "%{$q}%");
            });
        }

        $p = $query->orderBy('attended_at', 'desc')->paginate($perPage, ['*'], 'page', $page);

        $data = collect($p->items())->map(function ($r) {
            return [
                'id'          => $r->id,
                'event_id'    => $r->event_id,
                'event_name'  => optional($r->event)->name ?? null,
                'attended_at' => optional($r->attended_at)?->toDateTimeString(),
                'status'      => $r->status,
            ];
        })->all();

        return [
            'meta'    => ['type' => 'event', 'q' => $q],
            'summary' => ['total' => $p->total()],
            'rows'    => [
                'data'       => $data,
                'pagination' => [
                    'page'     => $p->currentPage(),
                    'per_page' => $p->perPage(),
                    'total'    => $p->total(),
                ],
            ],
        ];
    }
}
