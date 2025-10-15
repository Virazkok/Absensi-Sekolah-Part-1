<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;

class ArrayExport implements FromArray
{
    protected $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function array(): array
    {
        $header = ["Nama", "Keterangan", "Hadir", "Tidak Hadir", "Terlambat"];
        $rows = collect($this->data)->map(fn($row) => [
            $row['nama'],
            $row['keterangan'],
            $row['hadir'],
            $row['tidak_hadir'],
            $row['terlambat'],
        ])->toArray();

        return array_merge([$header], $rows);
    }
}
