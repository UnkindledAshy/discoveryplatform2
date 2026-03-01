'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';


interface Game {
    id: number;
    title: string;
    description: string;
    genre: string;
    platform: string;
    cost: number;
    banner_image: string | null;
}

interface PaginationData {
    current_page: number;
    last_page: number;
    total: number;
    data: Game[];
}

export default function GamesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [gamesData, setGamesData] = useState<PaginationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
    const [genre, setGenre] = useState(searchParams.get('genre') || 'all');
    const [platform, setPlatform] = useState(searchParams.get('platform') || 'all');
    const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
    const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);

    const [genresList, setGenresList] = useState<any[]>([]);
    const [platformsList, setPlatformsList] = useState<any[]>([]);

    const [reviewingGame, setReviewingGame] = useState<Game | null>(null);
    const [reviewContent, setReviewContent] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [postingReview, setPostingReview] = useState(false);

    const fetchGames = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);

            if (genre !== 'all') {
                params.append('genres', genre);
            }

            if (platform !== 'all') {
                params.append('platforms', platform);
            }

            params.append('page', page.toString());
            params.append('page_size', '12');

            const response = await api.get(`/games?${params.toString()}`);
            const rawData = response.data;

            const gamesDataList = rawData.games?.results || [];

            const games: Game[] = gamesDataList.map((rawGame: any) => ({
                id: rawGame.id,
                title: rawGame.name,
                description: `Released: ${rawGame.released || 'Unknown'} | Rating: ${rawGame.rating || 'N/A'}`,
                genre: rawGame.genres?.map((g: any) => g.name).join(', ') || 'Unknown',
                platform: rawGame.parent_platforms?.map((p: any) => p.platform.name).join(', ') || 'Unknown',
                cost: 59.99,
                banner_image: rawGame.background_image
            }));

            setGamesData({
                current_page: page,
                last_page: Math.max(1, Math.ceil((rawData.games?.count || 0) / 12)),
                total: rawData.games?.count || 0,
                data: games
            });

            if (rawData.genres?.results && genresList.length === 0) {
                setGenresList(rawData.genres.results);
            }
            if (rawData.platforms?.results && platformsList.length === 0) {
                setPlatformsList(rawData.platforms.results.filter((p: any) => p && p.id && p.name));
            }
        } catch (error) {
            console.error('Failed to fetch games', error);
        } finally {
            setLoading(false);
        }
    }, [search, genre, platform, page]);

    useEffect(() => {
        fetchGames();
    }, [fetchGames]);

    // Carousel Auto-play
    useEffect(() => {
        if (!gamesData || gamesData.data.length === 0) return;
        const interval = setInterval(() => {
            setActiveCarouselIndex((prev) => (prev + 1) % Math.min(gamesData.data.length, 5));
        }, 5000);
        return () => clearInterval(interval);
    }, [gamesData]);

    const carouselGames = useMemo(() => {
        return gamesData ? gamesData.data.slice(0, 5) : [];
    }, [gamesData]);

    const handlePostReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setPostingReview(true);
        try {
            await api.post('/reviews', {
                game_id: reviewingGame?.id,
                content: reviewContent,
                rating: reviewRating
            });
            setReviewingGame(null);
            setReviewContent('');
            setReviewRating(5);
            alert('Review posted! Check your profile.');
        } catch (err) {
            console.error('Failed to post review', err);
            alert('Failed to post review. Please try again.');
        } finally {
            setPostingReview(false);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-8 md:px-16">
            <div className="absolute inset-0 dashed-grid opacity-10 pointer-events-none"></div>

            {/* Header Section */}
            <div className="relative z-10 mb-16 border-b border-[#333] border-dashed pb-12">
                <div className="inline-block px-3 py-1 mb-4 border border-blue-600/30 bg-blue-600/5 text-[10px] uppercase tracking-[0.3em] font-black text-blue-500">
                    Game Library
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
                    GAME TITLES<span className="text-blue-600">.</span>
                </h1>
                <p className="max-w-xl text-white/40 text-sm font-medium leading-relaxed">
                    Explore the complete library of game titles integrated with the Discovery platform. Use filters to narrow down your search.
                </p>
            </div>

            {/* Filter & Search Bar */}
            <div className="relative z-10 flex flex-col md:flex-row gap-0 mb-12 bg-black border border-[#333] border-dashed overflow-hidden">
                <form onSubmit={handleSearchSubmit} className="relative w-full md:w-1/3 dashed-border-r h-16">
                    <input
                        type="text"
                        placeholder="GAME_TITLE..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full h-full px-12 bg-transparent text-[10px] uppercase font-black tracking-widest outline-none focus:bg-blue-600/5 transition-all"
                    />
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </form>

                <div className="flex flex-1 items-center">
                    <select
                        value={genre}
                        onChange={(e) => { setGenre(e.target.value); setPage(1); }}
                        className="h-full px-6 bg-transparent text-[10px] uppercase font-black tracking-widest dashed-border-r outline-none cursor-pointer hover:bg-white/5 transition-all"
                    >
                        <option className="bg-black" value="all">GENRE / ALL</option>
                        {genresList.map((g: any) => (
                            <option key={g.id} className="bg-black" value={g.slug || g.id}>
                                {g.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={platform}
                        onChange={(e) => { setPlatform(e.target.value); setPage(1); }}
                        className="h-full px-6 bg-transparent text-[10px] uppercase font-black tracking-widest dashed-border-r outline-none cursor-pointer hover:bg-white/5 transition-all"
                    >
                        <option className="bg-black" value="all">PLATFORM / ALL</option>
                        {platformsList.map((p: any) => (
                            <option key={p.id} className="bg-black" value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Games Grid */}
            {loading ? (
                <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-0 border-t border-l border-[#333] border-dashed">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="aspect-[3/4] border-r border-b border-[#333] border-dashed animate-pulse bg-white/5"></div>
                    ))}
                </div>
            ) : (
                <>
                    <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-0 border-t border-l border-[#333] border-dashed bg-black">
                        {gamesData?.data.map((game) => (
                            <Link href={`/games/${game.id}`} key={game.id} className="group relative border-r border-b border-[#333] border-dashed overflow-hidden flex flex-col hover:bg-blue-600/5 transition-all duration-500 block">
                                <div className="aspect-[3/4] overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-500">
                                    <img
                                        src={game.banner_image ? game.banner_image : 'https://placehold.co/400x600/111/white?text=No+Image'}
                                        alt={game.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>
                                <div className="p-4 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-black text-xs uppercase tracking-tighter mb-1 group-hover:text-blue-500 transition-colors line-clamp-1">{game.title}</h3>
                                        <div className="flex gap-2">
                                            <span className="text-[8px] uppercase font-black text-white/30 tracking-[0.2em]">{game.genre}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-0 mt-4 border border-[#333] border-dashed">
                                        <div className="flex-1 py-1.5 text-center text-[8px] uppercase tracking-widest font-black text-white/50 group-hover:bg-blue-600 group-hover:text-white transition-all">View Game</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Review Modal - functionality moved to game details */}

                    {/* Pagination */}
                    {gamesData && gamesData.last_page > 1 && (
                        <div className="relative z-10 mt-16 flex justify-center items-center gap-0 border border-[#333] border-dashed w-fit mx-auto">
                            <button
                                disabled={page <= 1}
                                onClick={() => {
                                    setPage((p) => Math.max(1, p - 1));
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="p-4 disabled:opacity-30 hover:bg-white/5 transition-all border-r border-[#333] border-dashed flex items-center gap-3 text-white/50 hover:text-white"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                                <span className="text-[10px] uppercase font-black tracking-widest">{page > 1 ? `PAGE ${page - 1}` : 'START'}</span>
                            </button>
                            <span className="px-8 text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">
                                CURRENT: {page}
                            </span>
                            <button
                                disabled={page >= gamesData.last_page}
                                onClick={() => {
                                    setPage((p) => Math.min(gamesData.last_page, p + 1));
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="p-4 disabled:opacity-30 hover:bg-white/5 transition-all border-l border-[#333] border-dashed flex items-center gap-3 text-white/50 hover:text-white"
                            >
                                <span className="text-[10px] uppercase font-black tracking-widest">{page < gamesData.last_page ? `PAGE ${page + 1}` : 'END'}</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
