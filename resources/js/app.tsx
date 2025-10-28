import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import axios from 'axios';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/OrangTua/ParentTeacherDashboard";
import AttendanceHistory from "./pages/OrangTua/RiwayatOrangTuaGuru";
import { Toaster } from "react-hot-toast";
<Toaster position="top-right" />



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/parent-teacher/dashboard" element={<Dashboard />} />
        <Route path="/parent-teacher/attendance-history" element={<AttendanceHistory />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;



axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Tambahan ini WAJIB agar token CSRF tidak hilang:
const token = document.head?.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
} else {
    console.error('CSRF token not found!');
}



axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.baseURL = 'http://127.0.0.1:8000'; // ← ini penting!




const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
