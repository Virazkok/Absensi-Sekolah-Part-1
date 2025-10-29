import { useEffect, useState } from 'react';
import BottomNavbar from '@/components/Murid/BottomNavbar';
import { toast } from 'react-toastify';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { PageProps, Student } from '@/types';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API_URL || window.location.origin;

const QRCheckInOut = ({ mode = 'in' }) => {
    const [user, setUser] = useState<Student | null>(null);
    const [scanned, setScanned] = useState(false);
    const [time, setTime] = useState('');
    const [qrCode, setQrCode] = useState<string>('');
    const [countdown, setCount] = useState(20);

    const fetchQrCode = () => {
        router.reload({
            only: ['qrCode'],
            onSuccess: page => {
                const props = page.props as unknown as PageProps & { qrCode: string };
                setQrCode(props.qrCode);
                setCount(20);
            },
            onError: () => console.error('gagal fetch QR'),
        });
    };

    useEffect(() => {
        // Fetch QR code immediately when the component mounts
        fetchQrCode();

        let tick: NodeJS.Timeout;
        let fetch: NodeJS.Timeout;

        const loop = () => {
            // Fetch new QR every 20 seconds
            fetch = setInterval(() => {
                fetchQrCode();
            }, 20000);

            // Update countdown every second
            tick = setInterval(() => {
                setCount((c) => {
                    if (c === 0) {
                        return 20; // Reset to 20 seconds
                    }
                    return c - 1;
                });
            }, 1000);
        };

        loop();
        return () => {
            clearInterval(tick);
            clearInterval(fetch);
        };
    }, []);

    useEffect(() => {
        // Mengambil data user dari localStorage terlebih dahulu
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser && storedUser.id) {
            console.log("📦 User dari localStorage:", storedUser);
            setUser(storedUser);
        } else {
            // Fallback ke API jika tidak ada di localStorage
            axios.get('/api/student/me')
                .then(res => {
                    setUser(res.data);
                    // Simpan ke localStorage untuk penggunaan berikutnya
                    localStorage.setItem('user', JSON.stringify(res.data));
                })
                .catch(err => {
                    console.error("Gagal fetch user", err);
                });
        }
    }, []);

    useEffect(() => {
        // Isi jam otomatis ketika load halaman
        const now = new Date();
        const formatted = now.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
        setTime(formatted);
    }, [mode]);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 px-6 pt-10 pb-6">
            <h2 className="text-2xl font-bold text-center mt-4">
                {mode === 'in' ? 'Check In' : 'Check Out'}
            </h2>

            <div className="flex-1 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm text-center">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300 shadow">
                            <img
                                src={user?.avatar || '/default-avatar.png'}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-semibold text-gray-600">
                                {user?.name || 'Nama Siswa'}
                            </h3>
                            <p className="text-sm text-gray-600">
                                Hari ini, {mode === 'in' ? 'check in' : 'check out'} jam {time}
                            </p>
                        </div>
                    </div>
                    <br /> <br />

                    <div className="rounded-2xl shadow-md bg-white flex items-center justify-center mb-3 py-6">
                        <div className="w-40 h-40 bg-gray-200 flex items-center justify-center text-gray-500">
                            {qrCode ? (
                                <div
                                    className="flex justify-center"
                                    key={qrCode}
                                    dangerouslySetInnerHTML={{ __html: qrCode }}
                                />
                            ) : (
                                <p className="text-center text-red-500">QR Code tidak tersedia</p>
                            )}
                        </div>
                    </div>
                    <br /> <br />

                    <p className="mt-2 text-center font-bold text-indigo-600">
                        Refreshing in {countdown}s
                    </p>
                    <p className="mt-1 text-center text-sm text-gray-600">
                        Tunjukkan QR Code ini saat absensi
                    </p>
                </div>
            </div>

            <button
                onClick={() => (window.location.href = '/murid/home')}
                className="mt-6 py-2 border border-orange-500 text-orange-500 rounded-lg font-medium"
            >
                Selesai
            </button>
        </div>
    );
};

export default QRCheckInOut;