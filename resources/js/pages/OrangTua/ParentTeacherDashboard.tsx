import React from "react";
import { Link } from "@inertiajs/react";
import {
  Home,
  QrCode,
  Clock,
  User,
  Calendar,
  Users,
  School,
} from "lucide-react";
import BottomNavbarOrtu from "@/components/OrangTuGuru/BottomNavbarOrtu";

const ParentTeacherDashboard: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Header */}
      <div className="p-6">
        <h1 className="text-2xl font-bold">Hallo,</h1>
        <p className="text-gray-600">Cek kehadiran. Mau mulai dari mana?</p>
      </div>

      {/* Rekap Kehadiran */}
      <div className="px-6">
        <h2 className="font-semibold text-lg mb-4">Rekap Kehadiran</h2>
        <div className="space-y-3">
          <Link
            href="/parent-teacher/attendance-history?type=sekolah"
            className="flex items-center justify-between bg-purple-600 text-white py-4 px-4 rounded-xl shadow-md"
          >
            <div className="flex items-center gap-3">
              <School className="w-6 h-6" />
              <span className="font-medium">Kehadiran Sekolah</span>
            </div>
            <div className="bg-orange-500 p-2 rounded-full">
              <span className="text-black font-bold">{"->"}</span>
            </div>
          </Link>

          <Link
            href="/parent-teacher/attendance-history?type=eskul"
            className="flex items-center justify-between bg-purple-600 text-white py-4 px-4 rounded-xl shadow-md"
          >
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6" />
              <span className="font-medium">Kehadiran Ekstrakurikuler</span>
            </div>
            <div className="bg-orange-500 p-2 rounded-full">
              <span className="text-black font-bold">{"->"}</span>
            </div>
          </Link>

          <Link
            href="/parent-teacher/attendance-history?type=event"
            className="flex items-center justify-between bg-purple-600 text-white py-4 px-4 rounded-xl shadow-md"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6" />
              <span className="font-medium">Kehadiran Event</span>
            </div>
            <div className="bg-orange-500 p-2 rounded-full">
              <span className="text-black font-bold">{"->"}</span>
            </div>
          </Link>
        </div>
      </div>

      <BottomNavbarOrtu />
    </div>
  );
};

export default ParentTeacherDashboard;
  