import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { router } from '@inertiajs/react';
import { PageProps } from '@inertiajs/core';
import BottomNavbar from '@/components/Murid/BottomNavbar';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://192.168.1.105:8000'; // <-- tidak ada spasi

export default function QrCode({ qrCode: initialQrCode, auth }: { qrCode: string } & any) {
  const [qrCode, setQrCode]   = useState<string>(initialQrCode);
  const [countdown, setCount] = useState(20);


const fetchQrCode = () => {
  router.reload({
    only: ['qrCode'],
    onSuccess: page => {
      const props = page.props as unknown as PageProps & { qrCode: string };
      setQrCode(props.qrCode);
    },
    onError: () => console.error('gagal fetch QR'),
  });
};

  useEffect(() => {
  let tick: NodeJS.Timeout;
  let fetch: NodeJS.Timeout;

  const loop = () => {
    // 1️⃣ every 20 s
    fetch = setInterval(() => {
      fetchQrCode();           // fetch new QR
    }, 20000);

    // 2️⃣ every 1 s
    tick = setInterval(() => {
      setCount((c) => {
        if (c === 0) {
                // force fetch NOW
          return 20;           // reset to 20 s
        }
        return c - 1;
      });
    }, 1000);
  };

  loop();                       // start immediately
  return () => {
    clearInterval(tick);
    clearInterval(fetch);
  };
}, []);
  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="QR Code Saya" />
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">QR Code Absensi Saya</h2>

            {qrCode ? (
              <div 
              className="flex justify-center"
              key={qrCode}
              dangerouslySetInnerHTML={{ __html: qrCode }} />
            ) : (
              <p className="text-center text-red-500">QR Code tidak tersedia</p>
            )}

            {/* countdown */}
            <p className="mt-2 text-center font-bold text-indigo-600">
              Refreshing in {countdown}s
            </p>
            <p className="mt-1 text-center text-sm text-gray-600">
              Tunjukkan QR Code ini saat absensi
            </p>
          </div>
        </div>
      </div>
      
    </AuthenticatedLayout>
    
  );
}