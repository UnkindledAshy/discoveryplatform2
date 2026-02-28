'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Hero from '@/components/hero';
import Features from '@/components/features';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // We can keep the auth check or remove it for the landing page.
    // Usually a landing page is public, but let's keep it for now if that's the desired flow.
    const token = localStorage.getItem('token');
    // if (!token) {
    //   router.push('/login');
    // }
  }, [router]);

  return (
    <main className="min-h-screen bg-black">
      <Hero />
      <Features />

      {/* Footer-like section */}
      <section className="bg-black text-white py-5 px-3 md:px-8 border-t border-[#333] border-dashed">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
        </div>
        <div className="mt-24 pt-8 border-t border-[#333] border-dashed flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-white/20">
          <span>© 2026 DISCOVERY PLATFORM</span>
          <div className="flex gap-8">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </section>
    </main>
  );
}
