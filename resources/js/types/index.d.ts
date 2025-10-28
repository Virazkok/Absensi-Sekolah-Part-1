// resources/js/types.ts
import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';


export interface Kelas {
    id: number;
    nama: string;
    created_at: string;
    updated_at: string;
}

export interface Murid {
    id: number;
    nis: string;
    nama: string;
    kelas_id?: number;
    kelas?: Kelas;
    user_id?: number;
    foto?: string;
    avatar?: string;
    scanned_at?: string;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    nis: string;
    role: string;
    kelas_id?: number;
    kelas?: Kelas;
    murid?: Murid;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface KehadiranSekolah {
    id: number;
    murid_id: number;
    kelas_id: number;
    tanggal: string;
    jam_masuk: string | null;
    jam_keluar: string | null;
    kehadiran: 'hadir' | 'terlambat' | 'tidak hadir' | 'izin' | 'sakit';
    murid?: Murid;
    kelas?: Kelas;
}

export interface Eskul {
    id: number;
    nama: string;
    deskripsi: string;
    created_at: string;
    updated_at: string;
}

export interface AbsensiEskul {
    id: number;
    eskul_id: number;
    eskul?: Eskul;
}

export interface KehadiranEskul {
    id: number;
    absensi_eskul_id: number;
    user_id: number;
    tanggal: string;
    jam_absen: string | null;
    status: 'hadir' | 'terlambat' | 'tidak hadir' | 'izin' | 'sakit';
    foto?: string | null;
    absensi?: AbsensiEskul;
    user?: User;
}

export interface Event {
    id: number;
    nama: string;
}

export interface EventRegistration {
    id: number;
    sport_category: string;
    created_at: string;
    updated_at: string;
    event?: Event;
    User?: User;
    [key: string]: unknown;
}

export interface KehadiranEvent {
    id: number;
    event_id: number;
    murid_id: number;
    attended_at: string | null;
    scan_method: string | null;
    status: 'hadir' | 'tidak hadir';
    event?: Event;
    murid?: Murid;
}

export interface AttendanceData {
    school: KehadiranSekolah[];
    eskul: KehadiranEskul[];
    event: KehadiranEvent[];
}

export interface DashboardResponse {
    murids: User[];
    message: string;
}

export interface AttendanceHistoryResponse {
    school_attendance: KehadiranSekolah[];
    eskul_attendance: KehadiranEskul[];
    event_attendance: KehadiranEvent[];
    message: string;
}

export interface PageProps {
    auth: {
        user: User;
    };
    event?: Event;
    registration?: EventRegistration;
    lastScanned?: {
        name: string;
        event: string;
        time: string;
    };
}

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface Student {
    avatar: any;
    nama: string;
    foto: string;
    User: any;
    kelas: any;
    scanned_at: string;
    id: number;
    nis: string;
    name: string;
    class_id: number;
    qr_token: string;
    kelas_id: {
        name: string;
    };
    created_at: string;
    updated_at: string;
}

export interface Attendance {
    kehadiran: string;
    jam_masuk: any;
    tanggal: any;
    kelas: any;
    murid: any;
    id: number;
    student_id: number;
    class_id: number;
    date: string;
    time_in: string;
    status: 'present' | 'late' | 'absent';
    created_at: string;
    updated_at: string;
    student?: any;
    class_room?: any;
}

export interface ScanResponse {
    message: string;
    student: Student;
    attendance: Attendance;
}

export interface QrResponse {
    qr_code: string;
    expires_in: number;
}

export interface ApiError {
    message?: string;
    error?: string;
    [key: string]: any;
}

export interface ApiResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: any;
    request?: any;
}

export interface LastScanned {
    user: {
        id: number;
        name: string;
    };
    registration: {
        id: number;
        sport_category?: string | null;
    };
}