import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";
import { Camera } from "lucide-react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import BottomNavbarOrtu from "@/components/OrangTuGuru/BottomNavbarOrtu";

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  role?: string;
}

interface EditProfileOrtuGuruProps {
  auth: {
    user: User;
  };
}

const EditProfileOrtuGuru: React.FC<EditProfileOrtuGuruProps> = ({ auth }) => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    axios.get("/api/parent/me").then((res) => {
      setUser(res.data);
      setEmail(res.data.email);
    });
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setAvatar(e.target.files[0]);

      const reader = new FileReader();
      reader.onload = () => {
        if (user) {
          setUser({ ...user, avatar: reader.result as string });
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);

      const formData = new FormData();
      formData.append("email", email);
      if (passwordLama) formData.append("password_lama", passwordLama);
      if (passwordBaru) formData.append("password_baru", passwordBaru);
      if (avatar) formData.append("avatar", avatar);

      const response = await axios.post("/api/parent/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      router.visit("/parent-teacher/dashboard");
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Gagal update profil");
      }
    }
  };

  if (!user) return <p className="p-4">Loading...</p>;

  return (
  <div className="mx-auto bg-white min-h-screen flex flex-col">
    {/* Header */}
    <div className="bg-purple-700 p-4 flex items-center gap-4">
      {/* Avatar */}
      <div className="relative w-24 h-24 flex-shrink-0">
        <img
          src={user.avatar || "/default-avatar.png"}
          alt="Foto Profil"
          className="w-24 h-24 rounded-full object-cover"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-1 right-1 bg-orange-500 text-white p-2 rounded-full shadow-md hover:bg-orange-600"
        >
          <Camera size={18} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

      <div className="flex flex-col">
        <h1 className="font-semibold text-[23px] text-white">{user.name}</h1>
        <p className="text-xs text-gray-200">{auth.user.role || "Orang Tua"}</p>
      </div>
    </div>

    {error && <p className="text-red-500 text-sm p-3">{error}</p>}

    {/* ⬇️ FORM dibungkus biar center di desktop */}
    <div className="flex-1 flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="p-4 space-y-5 text-gray-900 w-full max-w-md mx-auto"
      >
        {/* Akun */}
        <div>
          <h2 className="font-semibold mb-2 text-base">Akun</h2>
          <div className="space-y-2">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded px-2 py-1.5 text-sm"
              />
            </div>

            {/* Password Lama */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Password Aktif
              </label>
              <div className="relative">
                <input
                  type={showPassword1 ? "text" : "password"}
                  placeholder="Masukkan password lama"
                  value={passwordLama}
                  onChange={(e) => setPasswordLama(e.target.value)}
                  className="w-full border rounded px-2 py-1.5 text-sm pr-8"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 flex items-center"
                  onClick={() => setShowPassword1(!showPassword1)}
                >
                  {showPassword1 ? (
                    <EyeSlashIcon className="w-4 h-4 text-gray-500" />
                  ) : (
                    <EyeIcon className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Baru */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Password Baru
              </label>
              <div className="relative">
                <input
                  type={showPassword2 ? "text" : "password"}
                  placeholder="Kosongkan jika tidak ingin ganti"
                  value={passwordBaru}
                  onChange={(e) => setPasswordBaru(e.target.value)}
                  className="w-full border rounded px-2 py-1.5 text-sm pr-8"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 flex items-center"
                  onClick={() => setShowPassword2(!showPassword2)}
                >
                  {showPassword2 ? (
                    <EyeSlashIcon className="w-4 h-4 text-gray-500" />
                  ) : (
                    <EyeIcon className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2 pb-20"> 
          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm font-medium shadow-md active:scale-[0.98] transition"
          >
            Simpan
          </button>
          <button
            type="button"
            onClick={() => router.visit("/parent-teacher/dashboard")}
            className="w-full bg-white text-black border border-orange-400 py-2 rounded-lg text-sm font-medium shadow-md active:scale-[0.98] transition"
          >
            Batal
          </button>
        </div>
      </form>
    </div>

    <BottomNavbarOrtu />
  </div>
);

};

export default EditProfileOrtuGuru;
