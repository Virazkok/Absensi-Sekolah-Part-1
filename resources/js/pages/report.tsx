// resources/js/Pages/Reports.tsx
import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { PageProps, Attendance } from '@/types';

const Reports: React.FC<PageProps> = ({ auth, attendances = [], classAttendances = {} }) => {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Laporan Absensi</h2>}
        >
            <Head title="Laporan Absensi" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-lg font-medium mb-4">Absensi Seluruh Sekolah</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="py-3 px-4 border text-left">Nama Siswa</th>
                                            <th className="py-3 px-4 border text-left">Kelas</th>
                                            <th className="py-3 px-4 border text-left">Tanggal</th>
                                            <th className="py-3 px-4 border text-left">Waktu</th>
                                            <th className="py-3 px-4 border text-left">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendances.map((attendance) => (
                                            <tr key={attendance.id} className="hover:bg-gray-50">
                                                <td className="py-2 px-4 border">{attendance.murid?.nama}</td>
                                                <td className="py-2 px-4 border">{attendance.kelas?.name}</td>
                                                <td className="py-2 px-4 border">{attendance.tanggal}</td>
                                                <td className="py-2 px-4 border">{attendance.jam_masuk}</td>
                                                <td className="py-2 px-4 border">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        attendance.kehadiran === 'hadir' 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : attendance.kehadiran === 'telat' 
                                                                ? 'bg-yellow-100 text-yellow-800' 
                                                                : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {attendance.kehadiran}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <h3 className="text-lg font-medium mt-8 mb-4">Absensi per Kelas</h3>
                            {Object.entries(classAttendances).map(([className, classAtt]) => (
                                <div key={className} className="mb-8">
                                    <h4 className="font-medium mb-2">Kelas {className}</h4>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white border">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="py-3 px-4 border text-left">Nama Siswa</th>
                                                    <th className="py-3 px-4 border text-left">Tanggal</th>
                                                    <th className="py-3 px-4 border text-left">Waktu</th>
                                                    <th className="py-3 px-4 border text-left">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {classAtt.map((attendance) => (
                                                    <tr key={attendance.id} className="hover:bg-gray-50">
                                                        <td className="py-2 px-4 border">{attendance.murid?.nama}</td>
                                                        <td className="py-2 px-4 border">{attendance.tanggal}</td>
                                                        <td className="py-2 px-4 border">{attendance.jam_masuk}</td>
                                                        <td className="py-2 px-4 border">
                                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                                attendance.kehadiran === 'hadir' 
                                                                    ? 'bg-green-100 text-green-800' 
                                                                    : attendance.kehadiran === 'telat' 
                                                                        ? 'bg-yellow-100 text-yellow-800' 
                                                                        : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {attendance.kehadiran}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Reports;