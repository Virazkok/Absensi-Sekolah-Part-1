// resources/js/Layouts/AuthenticatedLayout.tsx
import React, { ReactNode } from 'react';
import { Head, Link } from '@inertiajs/react';

interface AuthenticatedLayoutProps {
    user: {
        name: string;
        email: string;
    };
    header?: ReactNode;
    children: ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ user, header, children }) => {
    return (
         <div className="min-h-screen bg-white">
      <Head>
        <title>Absensi Sekolah</title>
        <meta name="description" content="Sistem Absensi Sekolah" />
      </Head>

      <main>{children}</main>
    </div>
    );
};

export default AuthenticatedLayout;