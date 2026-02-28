'use client';

import Image from 'next/image';
import Link from 'next/link';

const Hero = () => {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-between px-8 md:px-16 pt-24 overflow-hidden bg-black text-white">
            {/* Background Grid */}
            <div className="absolute inset-0 dashed-grid opacity-20 pointer-events-none"></div>

            <div className="w-full md:w-1/2 z-10">
                <div className="inline-block px-3 py-1 mb-6 border border-blue-600/30 bg-blue-600/5 text-[10px] uppercase tracking-[0.3em] font-black text-blue-500">
                    Discovery of games
                </div>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
                    DISCOVER<br />
                    <span className="text-blue-600">LATEST</span><br />
                    GAMES<span className="text-blue-600">.</span>
                </h1>
                <p className="max-w-md text-white/50 text-lg mb-12 font-medium leading-relaxed">
                    The next generation discovery platform for all the new games on every platform.
                </p>
                <div className="flex items-center gap-6">
                    <Link
                        href="/login"
                        className="px-10 py-4 bg-blue-600 text-white text-xs uppercase tracking-[0.3em] font-black hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                        SIGN IN
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-[-2px]"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    </Link>
                    <Link
                        href="/games"
                        className="text-xs uppercase tracking-[0.3em] font-black text-white hover:text-blue-500 transition-all dashed-border-b pb-1"
                    >
                        Explore Games
                    </Link>
                </div>
            </div>

            <div className="hidden md:block w-1/2 relative h-[600px] z-10">
                <Image
                    src="/ghost_group.png"
                    alt="Discovery Graphics"
                    fill
                    className="object-contain"
                    priority
                />
                {/* Decorative elements */}
                <div className="absolute top-1/4 right-0 w-32 h-32 border border-blue-600/20 dashed-border-r dashed-border-b opacity-50"></div>
            </div>
        </section>
    );
}

export default Hero;
