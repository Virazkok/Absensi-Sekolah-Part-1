<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Kehadiran</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #000; padding: 6px; text-align: center; }
        th { background: #f0f0f0; }
    </style>
</head>
<body>
    <h2 style="text-align:center">Laporan Kehadiran ({{ ucfirst($type) }})</h2>
    <table>
        <thead>
            <tr>
                <th>Nama</th>
                <th>{{ $type === 'sekolah' ? 'Kelas' : ($type === 'eskul' ? 'Eskul' : 'Event') }}</th>
                <th>Hadir</th>
                <th>Tidak Hadir</th>
                <th>Terlambat</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $row)
            <tr>
                <td>{{ $row['nama'] }}</td>
                <td>{{ $row['keterangan'] }}</td>
                <td>{{ $row['hadir'] }}</td>
                <td>{{ $row['tidak_hadir'] }}</td>
                <td>{{ $row['terlambat'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
