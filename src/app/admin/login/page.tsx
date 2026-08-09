'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Lock, Mail, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail === 'admin@imanis.pk' && password === 'csKj!jtL*BC&8rA') {
      // Set session cookie & localStorage for persistent authentication lock
      document.cookie = 'imanis_admin_session=authenticated; path=/; max-age=2592000; SameSite=Lax';
      if (typeof window !== 'undefined') {
        localStorage.setItem('imanis_admin_session', 'authenticated');
      }
      setTimeout(() => {
        router.push('/admin');
      }, 300);
    } else {
      setError('Invalid admin credentials. Please check your username and password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center mx-auto mb-1">
            <Image
              src="/logo-icon-transparent.png"
              alt="Imani's Collection Logo"
              width={64}
              height={64}
              className="object-contain"
              unoptimized
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Imani's Admin Portal</h1>
          <p className="text-xs text-gray-500">Secure Store Administrator Login</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs" autoComplete="off">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                autoComplete="off"
                placeholder="Enter admin email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e] font-medium text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a63b7e] font-medium text-gray-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 p-0.5 focus:outline-none"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#a63b7e] hover:bg-[#872b64] text-white py-3 rounded-xl font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> {loading ? 'Authenticating...' : 'Sign In To Control Panel'}
          </button>
        </form>
      </div>
    </div>
  );
}
