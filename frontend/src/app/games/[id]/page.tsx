'use client';

import { useState, useEffect, useCallback, use } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

export default function GameDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const [game, setGame] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [reviewContent, setReviewContent] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [postingReview, setPostingReview] = useState(false);

    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const fetchGame = useCallback(async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const response = await api.get(`/games/${id}`);
            setGame(response.data);
        } catch (error: any) {
            console.error('Failed to fetch game details', error);
            setErrorMsg(error.message || 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchGame();
    }, [fetchGame]);

    const handlePostReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setPostingReview(true);
        try {
            await api.post('/reviews', {
                game_id: id,
                content: reviewContent,
                rating: reviewRating
            });
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

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center pt-24 pb-12">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!game) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center pt-24 pb-12">
                <h1 className="text-3xl font-black text-white/40 uppercase tracking-widest mb-4">ERROR_NO_DATA_FOUND</h1>
                {errorMsg && <p className="text-red-500 font-mono">{errorMsg}</p>}
                <p className="text-white/20 text-xs mt-4">ID Reference: {id}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-8 md:px-16">
            <div className="absolute inset-0 dashed-grid opacity-10 pointer-events-none"></div>

            <Link href="/games" className="relative z-10 inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/50 hover:text-blue-500 mb-8 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                Return to Library
            </Link>

            {/* Hero Image */}
            <div className="relative z-10 w-full h-[300px] md:h-[500px] mb-12 overflow-hidden border border-[#333] border-dashed">
                <img
                    src={game.background_image || 'https://placehold.co/1200x600/111/white?text=No+Image'}
                    alt={game.name}
                    className="w-full h-full object-cover brightness-50"
                />
                <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full bg-black/80 backdrop-blur-sm border-t border-[#333] border-dashed">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {game.genres?.map((g: any) => (
                            <span key={g.id} className="text-[10px] text-white/70 bg-white/10 px-2 py-1 uppercase font-black tracking-widest">{g.name}</span>
                        ))}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-2 tracking-tighter uppercase">{game.name}</h1>
                    <div className="flex gap-6 mt-4 opacity-70">
                        <span className="text-xs uppercase font-bold tracking-widest">Released: {game.released}</span>
                        <span className="text-xs uppercase font-bold tracking-widest">Rating: {game.rating} / 5</span>
                    </div>
                </div>
            </div>

            {/* Content Flex */}
            <div className="relative z-10 flex flex-col lg:flex-row gap-12 mb-16">
                {/* Left Col - Info */}
                <div className="lg:w-2/3">
                    <h2 className="text-2xl font-black tracking-tighter uppercase mb-6 border-b border-[#333] border-dashed pb-4">Description</h2>
                    <div
                        className="text-white/60 text-sm leading-relaxed mb-8 prose prose-invert"
                        dangerouslySetInnerHTML={{ __html: game.description || 'No data provided.' }}
                    />
                </div>

                {/* Right Col - Meta */}
                <div className="lg:w-1/3 space-y-8">
                    <div className="border border-[#333] border-dashed p-6 bg-white/5">
                        <h3 className="text-[10px] uppercase font-black text-blue-500 tracking-[0.3em] mb-4">Platforms</h3>
                        <div className="flex flex-wrap gap-2">
                            {game.platforms?.map((p: any) => (
                                <span key={p.platform.id} className="text-xs text-white/80 border border-[#333] border-dashed px-3 py-1 font-bold">{p.platform.name}</span>
                            ))}
                        </div>
                    </div>

                    <div className="border border-[#333] border-dashed p-6 bg-white/5">
                        <h3 className="text-[10px] uppercase font-black text-blue-500 tracking-[0.3em] mb-4">Developers</h3>
                        <div className="flex flex-wrap gap-2">
                            {game.developers?.map((d: any) => (
                                <span key={d.id} className="text-xs text-white/80 border border-[#333] border-dashed px-3 py-1 font-bold">{d.name}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Section */}
            <div className="relative z-10 border border-[#333] border-dashed p-8 md:p-12 bg-black">
                <div className="inline-block px-3 py-1 mb-4 border border-blue-600/30 bg-blue-600/5 text-[10px] uppercase tracking-[0.3em] font-black text-blue-500">
                    User Feedback
                </div>
                <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">Write a Review</h2>
                <p className="text-white/40 text-xs font-medium mb-8">Submit your review regarding this game to the discovery platform</p>

                <form onSubmit={handlePostReview} className="space-y-8 max-w-2xl">
                    <div>
                        <label className="block text-[8px] uppercase font-black text-white/30 tracking-[0.2em] mb-3">Rating Score</label>
                        <div className="flex gap-2 max-w-md">
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
                        <label className="block text-[8px] uppercase font-black text-white/30 tracking-[0.2em] mb-3">Comment</label>
                        <textarea
                            required
                            rows={5}
                            value={reviewContent}
                            onChange={(e) => setReviewContent(e.target.value)}
                            placeholder="DESCRIBE_YOUR_EXPERIENCE..."
                            className="w-full bg-transparent border border-[#333] border-dashed p-4 text-sm font-bold tracking-wider outline-none focus:bg-blue-600/5 transition-all resize-none"
                        />
                    </div>
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={postingReview}
                            className="py-4 px-12 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
                        >
                            {postingReview ? 'TRANSMITTING...' : 'POST_REVIEW'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
