'use client';

import React, { useEffect, useState } from 'react'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setIsLoggedIn(!!token);

    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await api.get('/logout');
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <nav className="fixed top-0 w-full flex items-center justify-between py-4 px-8 md:px-16 border-b border-[#333] border-dashed bg-black/90 backdrop-blur-sm z-[100]">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-xl font-black tracking-tighter text-white hover:text-blue-500 transition-colors">
          DISCOVERY<span className="text-blue-600">.</span>
        </Link>
        <div className="hidden md:flex gap-8 text-xs uppercase tracking-widest font-bold text-white/60">
          <Link href="/games" className="hover:text-white transition-colors">Games</Link>
          {isLoggedIn && <Link href="/profile" className="hover:text-white transition-colors">Profile</Link>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-black border border-[#333] border-dashed hover:border-blue-600 hover:text-blue-500 transition-all text-white/80"
          >
            Sign Out
          </button>
        ) : (
          <Link
            href="/login"
            className="px-6 py-2 bg-blue-600 text-white text-[10px] uppercase tracking-[0.2em] font-black hover:bg-blue-700 transition-all"
          >
            Get Started
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar