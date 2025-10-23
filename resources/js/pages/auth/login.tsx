import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import axios from 'axios';


axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://127.0.0.1:8000';


type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

  const submit: FormEventHandler = async (e) => {
  e.preventDefault();
  try {
    // 1. Ambil CSRF cookie dulu
   await axios.get("/sanctum/csrf-cookie");

const formData = new FormData();
formData.append('email', data.email);
formData.append('password', data.password);

await axios.post("/login", formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});


    // 3. Ambil data user yang sedang login
    const res = await axios.get("/api/student/me"); // pastikan kamu punya endpoint ini
    const student = res.data;

    // 4. Simpan ke localStorage
    localStorage.setItem("user", JSON.stringify(student));

    // 5. Redirect ke riwayat
    window.location.href = "/murid/home";
  } catch (err: any) {
    console.error("Login gagal", err);
    alert("Login gagal: " + err.message);
  }
};



    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm flex-col " onSubmit={submit}>
                <h2 className="text-2xl font-semibold text-center mb-6 text-gray-900">Login Siswa</h2>
                    <div className='grid gap-6'>
                    <div className='grid gap-2'>
                        <label className="block mb-2 text-sm text-gray-900 ">Email</label>
                        <Input
                    id="email"
                    type="email"
                    required
                    autoFocus
                    tabIndex={1}
                    autoComplete="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="email@example.com"
                    className="w-full border px-3 py-2 rounded mb-4 text-gray-900"
                />
                <InputError message={errors.email} />
            </div>
            <div className='grid gap-2'>
                <label className="block mb-2 text-sm text-gray-900">Password</label>
                <Input
                    id="password"
                    type="password"
                    required
                    tabIndex={2}
                    autoComplete="current-password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder="Password"
                    className="w-full border px-3 py-2 rounded mb-6 text-gray-900"
                />
                </div>
                <InputError message={errors.password} />

                <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded" onClick={submit}>
                    Login
                </button>
                </div>
            </form>
        </div>
    );
}
