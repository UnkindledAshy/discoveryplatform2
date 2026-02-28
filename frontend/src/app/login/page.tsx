'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/login', { email, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            router.push('/');
            router.refresh();
        } catch (err: any) {
            setError(err.response?.data?.message || 'ERR_INVALID_CREDENTIALS');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-8 relative overflow-hidden">
            <div className="absolute inset-0 dashed-grid opacity-10 pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-md border border-[#333] border-dashed bg-black p-10 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-[#333] border-dashed m-4"></div>

                <div className="mb-12">
                    <div className="inline-block px-3 py-1 mb-4 border border-blue-600 border-dashed text-[10px] uppercase tracking-[0.3em] font-black text-blue-500">
                        Join_The_Platform
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">
                        Sign_In<span className="text-blue-600">.</span>
                    </h1>
                    <p className="text-white/40 text-[10px] uppercase font-black tracking-[0.3em]">
                        Rejoin to the gaming discovery platform
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <label className="block text-[8px] uppercase font-black text-white/30 tracking-[0.2em]">Email</label>
                        <input
                            type="email"
                            placeholder="IDENT_USR@ENDPOINT.COM"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-transparent border border-[#333] border-dashed p-4 text-[10px] uppercase font-bold tracking-[0.2em] outline-none focus:bg-blue-600/5 focus:border-blue-600 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[8px] uppercase font-black text-white/30 tracking-[0.2em]">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-transparent border border-[#333] border-dashed p-4 text-[10px] uppercase font-bold tracking-[0.2em] outline-none focus:bg-blue-600/5 focus:border-blue-600 transition-all"
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-red-600/5 border border-red-600/20 text-red-500 text-[8px] uppercase font-black tracking-widest text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                        {loading ? 'AUTHENTICATING...' : 'SIGN_IN'}
                    </button>
                </form>

                <div className="mt-12 pt-8 border-t border-[#333] border-dashed text-center">
                    <p className="text-white/40 text-[8px] uppercase font-black tracking-[0.2em]">
                        No account found? {' '}
                        <Link href="/register" className="text-blue-500 hover:text-white transition-colors">
                            Create_Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
