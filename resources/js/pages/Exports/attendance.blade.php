<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Kehadiran</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #000; padding: 6px; text-align: left; }
        th { background: #f2f2f2; }
    </style>
</head>
<body>
    <h2>Laporan Kehadiran Siswa</h2>
    <table>
        <thead>
            <tr>
                <th>Nama</th>
                <th>Kelas</th>
                <th>Tanggal</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($records as $row)
                <tr>
                    <td>{{ $row->murid->nama ?? '-' }}</td>
                    <td>{{ $row->murid->kelas->name ?? '-' }}</td>
                    <td>{{ $row->tanggal->format('Y-m-d') }}</td>
                    <td>{{ $row->kehadiran }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
