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
    const [genre, setGenre] = useState(searchParams.get('genre') || 'all');
    const [platform, setPlatform] = useState(searchParams.get('platform') || 'all');
    const [order, setOrder] = useState(searchParams.get('order') || 'latest');
    const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
    const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);

    const [reviewingGame, setReviewingGame] = useState<Game | null>(null);
    const [reviewContent, setReviewContent] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [postingReview, setPostingReview] = useState(false);

    const fetchGames = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (genre !== 'all') params.append('genre', genre);
            if (platform !== 'all') params.append('platform', platform);
            if (order) params.append('order', order);
            params.append('page', page.toString());

            const response = await api.get(`/games?${params.toString()}`);
            setGamesData(response.data);
        } catch (error) {
            console.error('Failed to fetch games', error);
        } finally {
            setLoading(false);
        }
    }, [search, genre, platform, order, page]);

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
        setPage(1);
        fetchGames();
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

            {/* Carousel Section */}
            {!loading && carouselGames.length > 0 && (
                <div className="relative z-10 w-full h-[400px] md:h-[500px] mb-12 overflow-hidden border border-[#333] border-dashed">
                    {carouselGames.map((game, idx) => (
                        <div
                            key={game.id}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === activeCarouselIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                                }`}
                        >
                            <img
                                src={game.banner_image ? `http://api-backend.test/storage/${game.banner_image}` : 'https://placehold.co/1200x600/111/white?text=No+Image'}
                                alt={game.title}
                                className="w-full h-full object-cover brightness-50"
                            />
                            <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full bg-black/80 backdrop-blur-sm border-t border-[#333] border-dashed">
                                <span className="text-[10px] text-blue-500 font-black uppercase tracking-[0.3em] mb-2 inline-block">Featured Intel</span>
                                <h2 className="text-3xl md:text-5xl font-black mb-2 tracking-tighter uppercase">{game.title}</h2>
                                <p className="text-white/50 max-w-2xl text-xs line-clamp-2 uppercase tracking-widest font-bold">{game.description}</p>
                            </div>
                        </div>
                    ))}
                    {/* Carousel Dots */}
                    <div className="absolute top-8 right-8 z-20 flex gap-2">
                        {carouselGames.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveCarouselIndex(idx)}
                                className={`w-8 h-1 transition-all duration-300 ${idx === activeCarouselIndex ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.8)]' : 'bg-white/20'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Filter & Search Bar */}
            <div className="relative z-10 flex flex-col md:flex-row gap-0 mb-12 bg-black border border-[#333] border-dashed overflow-hidden">
                <form onSubmit={handleSearchSubmit} className="relative w-full md:w-1/3 dashed-border-r h-16">
                    <input
                        type="text"
                        placeholder="GAME_TITLE..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
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
                        <option className="bg-black" value="Action">Action</option>
                        <option className="bg-black" value="RPG">RPG</option>
                        <option className="bg-black" value="Shooter">Shooter</option>
                        <option className="bg-black" value="Sports">Sports</option>
                        <option className="bg-black" value="Strategy">Strategy</option>
                    </select>

                    <select
                        value={platform}
                        onChange={(e) => { setPlatform(e.target.value); setPage(1); }}
                        className="h-full px-6 bg-transparent text-[10px] uppercase font-black tracking-widest dashed-border-r outline-none cursor-pointer hover:bg-white/5 transition-all"
                    >
                        <option className="bg-black" value="all">PLATFORM / ALL</option>
                        <option className="bg-black" value="PC">PC</option>
                        <option className="bg-black" value="PlayStation">PlayStation</option>
                        <option className="bg-black" value="Xbox">Xbox</option>
                        <option className="bg-black" value="Nintendo">Nintendo</option>
                    </select>

                    <select
                        value={order}
                        onChange={(e) => { setOrder(e.target.value); setPage(1); }}
                        className="h-full px-6 bg-transparent text-[10px] uppercase font-black tracking-widest outline-none cursor-pointer hover:bg-white/5 transition-all"
                    >
                        <option className="bg-black" value="latest">SORT / LATEST</option>
                        <option className="bg-black" value="price_low">PRICE / MIN</option>
                        <option className="bg-black" value="price_high">PRICE / MAX</option>
                        <option className="bg-black" value="title_az">NAME / A-Z</option>
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
                            <div key={game.id} className="group relative border-r border-b border-[#333] border-dashed overflow-hidden flex flex-col hover:bg-blue-600/5 transition-all duration-500">
                                <div className="aspect-[3/4] overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-500">
                                    <img
                                        src={game.banner_image ? `http://api-backend.test/storage/${game.banner_image}` : 'https://placehold.co/400x600/111/white?text=No+Image'}
                                        alt={game.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-0 right-0 px-2 py-1 bg-black text-[10px] font-black text-white border-b border-l border-[#333] border-dashed">
                                        ${game.cost}
                                    </div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-black text-xs uppercase tracking-tighter mb-1 group-hover:text-blue-500 transition-colors line-clamp-1">{game.title}</h3>
                                        <div className="flex gap-2">
                                            <span className="text-[8px] uppercase font-black text-white/30 tracking-[0.2em]">{game.genre}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-0 mt-4 border border-[#333] border-dashed">
                                        <button className="flex-1 py-1.5 text-[8px] uppercase tracking-widest font-black hover:bg-blue-600 hover:text-white transition-all dashed-border-r">Intel</button>
                                        <button
                                            onClick={() => setReviewingGame(game)}
                                            className="px-3 py-1.5 text-[8px] uppercase tracking-widest font-black hover:bg-blue-600 hover:text-white transition-all"
                                        >
                                            Review
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Review Modal */}
                    {reviewingGame && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
                            <div className="bg-black border border-[#333] border-dashed w-full max-w-md p-10 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
                                <h2 className="text-3xl font-black mb-2 tracking-tighter uppercase">Write Review</h2>
                                <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] mb-8">Accessing game_id: {reviewingGame.id}</p>

                                <form onSubmit={handlePostReview} className="space-y-8">
                                    <div>
                                        <label className="block text-[8px] uppercase font-black text-white/30 tracking-[0.2em] mb-3">Rating Score</label>
                                        <div className="flex justify-between gap-2">
                                            {[1, 2, 3, 4, 5].map((num) => (
                                                <button
                                                    key={num}
                                                    type="button"
                                                    onClick={() => setReviewRating(num)}
                                                    className={`flex-1 py-3 text-xs font-black border border-[#333] border-dashed transition-all ${num <= reviewRating ? 'bg-blue-600 text-white' : 'bg-transparent text-white/20'
                                                        }`}
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[8px] uppercase font-black text-white/30 tracking-[0.2em] mb-3">Narrative</label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={reviewContent}
                                            onChange={(e) => setReviewContent(e.target.value)}
                                            placeholder="DESCRIBE_YOUR_EXPERIENCE..."
                                            className="w-full bg-transparent border border-[#333] border-dashed p-4 text-xs font-bold uppercase tracking-widest outline-none focus:bg-blue-600/5 transition-all resize-none"
                                        />
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="submit"
                                            disabled={postingReview}
                                            className="flex-1 py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
                                        >
                                            {postingReview ? 'TRANSMITTING...' : 'POST_INTEL'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setReviewingGame(null)}
                                            className="flex-1 py-4 border border-[#333] border-dashed text-white/40 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
                                        >
                                            CANCEL
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {gamesData && gamesData.last_page > 1 && (
                        <div className="relative z-10 mt-16 flex justify-center items-center gap-0 border border-[#333] border-dashed w-fit mx-auto">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="p-4 disabled:opacity-30 hover:bg-white/5 transition-all dashed-border-r"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <span className="px-8 text-[10px] font-black uppercase tracking-[0.3em]">
                                Page {page} <span className="text-blue-600">OFFSET</span> {gamesData.last_page}
                            </span>
                            <button
                                disabled={page === gamesData.last_page}
                                onClick={() => setPage((p) => Math.min(gamesData.last_page, p + 1))}
                                className="p-4 disabled:opacity-30 hover:bg-white/5 transition-all border-l border-[#333] border-dashed"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    )}

                    {gamesData?.data.length === 0 && (
                        <div className="relative z-10 text-center py-24 border border-[#333] border-dashed mt-12 bg-white/5">
                            <h2 className="text-2xl font-black text-white/20 uppercase tracking-[0.3em]">NULL_RESULTS_FOUND</h2>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
