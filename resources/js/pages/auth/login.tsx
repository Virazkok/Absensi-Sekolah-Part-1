import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import axios from 'axios';

import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';

axios.defaults.withCredentials = true;
axios.defaults.baseURL =  window.location.origin;

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
  const { data, setData, post, processing, errors } = useForm<Required<LoginForm>>({
    email: '',
    password: '',
    remember: false,
  });

  const submit: FormEventHandler = async (e) => {
    e.preventDefault();
    try {
      await axios.get('/sanctum/csrf-cookie');

      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);

      await axios.post('/login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const res = await axios.get('/api/student/me');
      localStorage.setItem('user', JSON.stringify(res.data));

      window.location.href = '/murid/home';
    } catch (err: any) {
      console.error('Login gagal', err);
      alert('Login gagal: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-[4.0px_8.0px_8.0px_rgba(0,0,0,0.38)] w-full max-w-270 flex-col overflow-hidden">
        {/* Bagian atas (gambar) */}
        <div className="flex justify-center bg-white relative">
          <img
            src="/icons/Icon-Login.jpeg"
            alt="Login Illustration"
            className="mt-6 w-276px h-276px object-contain"
          />
        </div>

        {/* Form dengan wave di belakang tulisan Log In */}
        <form
          className="relative bg-[#640FB4]  text-white p-6 pt-12 shadow-md w-full flex flex-col justify-center items-center overflow-hidden"
          onSubmit={submit}
        >
          {/* SVG wave di belakang tulisan */}
          <svg
            className="absolute top-0 left-0 bottom-0 "
            viewBox="0 100 1440 320"
            xmlns="http://www.w3.org/2000/svg"
          > 
            <path
              fill="white"
            d="M0,160L0,154.7C160,149,320,139,480,144C640,149,800,171,960,181.3C1120,192,1280,192,1360,186.7L1440,181.3L1440,0L0,0Z"

            ></path>
          </svg>

          

          {/* Form content */}
          <div className="relative z-10 grid gap-6 w-full justify-center " >
            <h2 className="relative text-[36px] font-semibold mb-0 z-10 text-left">Log In</h2>
            {/* Email */}
            <div className="grid gap-2 w-80">
              <label className="block mb-2 text-[16px] text-white">Email</label>
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
                className="w-full border px-3 py-2 rounded text-white-900 text[14px] border-[#DD661D]"
              />
              <InputError message={errors.email} />
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <label className="block mb-2 text-[16px] text-white">Password</label>
              <Input
                id="password"
                type="password"
                required
                tabIndex={2}
                autoComplete="current-password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                placeholder="Password"
                className="w-full border px-3 py-2 rounded text-white-900 text[14px] border-[#DD661D]"
              />
              <InputError message={errors.password} />
            </div>

            {/* Tombol login */}
            <button
              type="submit"
              className="w-full bg-[#DD661D] hover:bg-[#DD661D] text-white py-2 rounded font-semibold transition-all"
              disabled={processing}
            >
              {processing ? 'Memproses...' : 'Gabung'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
