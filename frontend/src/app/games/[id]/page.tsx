'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, use, Suspense } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

function GameDetailsContent({ id }: { id: string }) {
    const [game, setGame] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [isFavorite, setIsFavorite] = useState(false);
    const [reviews, setReviews] = useState<any[]>([]);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [reviewContent, setReviewContent] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchGameData = async () => {
            setLoading(true);
            setErrorMsg(null);
            try {
                const response = await api.get(`/games/${id}`);
                setGame(response.data);

                // Check favorite status
                try {
                    const favRes = await api.get(`/favorites/${id}`);
                    setIsFavorite(favRes.data.is_favorite);
                } catch (e) {
                    setIsFavorite(false);
                }

                // Fetch reviews
                const reviewRes = await api.get(`/reviews?game_id=${response.data.id}`);
                setReviews(reviewRes.data);

                // Fetch recommendations (skip if unauthenticated to avoid 401 redirects)
                if (localStorage.getItem('token')) {
                    try {
                        const recRes = await api.get('/recommendations');
                        setRecommendations(recRes.data);
                    } catch (e) {
                        console.error('Failed fetching recommendations:', e);
                    }
                }
            } catch (error: any) {
                console.error('Error fetching game data:', error);
                setErrorMsg(error.message || 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchGameData();
    }, [id]);

    const toggleFavorite = async () => {
        try {
            const res = await api.post('/favorites', { game_id: game.id });
            setIsFavorite(res.data.is_favorite);
        } catch (error) {
            console.error('Error toggling favorite:', error);
            alert('Please login to favorite games.');
        }
    };

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            await api.post('/reviews', {
                game_id: game.id,
                content: reviewContent,
                rating: reviewRating
            });
            setReviewContent('');
            setReviewRating(5);
            const reviewRes = await api.get(`/reviews?game_id=${game.id}`);
            setReviews(reviewRes.data);
        } catch (error: any) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review. Make sure you are logged in.');
        } finally {
            setSubmittingReview(false);
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
                    src={game.banner_image || 'https://placehold.co/1200x600/111/white?text=No+Image'}
                    alt={game.title}
                    className="w-full h-full object-cover brightness-50"
                />
                <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full bg-black/80 backdrop-blur-sm border-t border-[#333] border-dashed">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {game.raw_genres?.map((g: any) => (
                            <span key={g.id} className="text-[10px] text-white/70 bg-white/10 px-2 py-1 uppercase font-black tracking-widest">{g.name}</span>
                        ))}
                    </div>
                    <div className="flex justify-between items-end gap-6 mb-2">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">{game.title}</h1>
                        <button
                            onClick={toggleFavorite}
                            className={`p-4 border border-dashed transition-all duration-500 group relative ${isFavorite
                                ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)]'
                                : 'bg-black/50 border-[#333] text-white/40 hover:border-blue-500 hover:text-blue-500'
                                }`}
                        >
                            <svg className={`w-8 h-8 transition-transform duration-500 ${isFavorite ? 'scale-110' : 'group-hover:scale-110'}`} fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {isFavorite && <div className="absolute inset-0 bg-blue-400/20 animate-ping pointer-events-none"></div>}
                        </button>
                    </div>
                    <div className="flex gap-6 mt-4 opacity-70">
                        <span className="text-xs uppercase font-bold tracking-widest">Released: {game.released}</span>
                        <span className="text-xs uppercase font-bold tracking-widest">Rating: {game.rating} / 5</span>
                    </div>
                </div>
            </div>

            {/* Content Flex */}
            <div className="relative z-10 flex flex-col lg:flex-row gap-12 mb-16">
                <div className="lg:w-2/3">
                    <h2 className="text-2xl font-black tracking-tighter uppercase mb-6 border-b border-[#333] border-dashed pb-4">Description</h2>
                    <div
                        className="text-white/60 text-sm leading-relaxed mb-8 prose prose-invert"
                        dangerouslySetInnerHTML={{ __html: game.description || 'No data provided.' }}
                    />
                </div>

                <div className="lg:w-1/3 space-y-8">
                    <div className="border border-[#333] border-dashed p-6 bg-white/5">
                        <h3 className="text-[10px] uppercase font-black text-blue-500 tracking-[0.3em] mb-4">Platforms</h3>
                        <div className="flex flex-wrap gap-2">
                            {game.raw_platforms?.map((p: any) => (
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
            <div className="relative z-10 border border-[#333] border-dashed p-8 md:p-12 bg-black mt-16">
                <div className="inline-block px-3 py-1 mb-4 border border-blue-600/30 bg-blue-600/5 text-[10px] uppercase tracking-[0.3em] font-black text-blue-500">
                    User Feedback
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Write Review */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">Write a Review</h2>
                            <p className="text-white/40 text-xs font-medium uppercase tracking-widest">Submit your intel report regarding this entry</p>
                        </div>

                        <form onSubmit={submitReview} className="space-y-8">
                            <div>
                                <label className="block text-[8px] uppercase font-black text-white/30 tracking-[0.2em] mb-4">Rating Score</label>
                                <div className="flex gap-2 max-w-sm">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => setReviewRating(num)}
                                            className={`flex-1 py-4 text-xs font-black border border-[#333] border-dashed transition-all ${num <= reviewRating ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-transparent text-white/20'}`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[8px] uppercase font-black text-white/30 tracking-[0.2em] mb-4">Intel Narrative</label>
                                <textarea
                                    required
                                    rows={6}
                                    value={reviewContent}
                                    onChange={(e) => setReviewContent(e.target.value)}
                                    placeholder="Enter your field report..."
                                    className="w-full bg-white/5 border border-[#333] border-dashed p-6 text-[10px] font-bold uppercase tracking-[0.2em] outline-none focus:bg-blue-600/5 transition-all resize-none text-white/80"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submittingReview}
                                className="w-full py-5 bg-blue-600 text-white text-[10px] uppercase tracking-[0.4em] font-black hover:bg-blue-700 transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] disabled:opacity-50"
                            >
                                {submittingReview ? 'Transmitting...' : 'Commit Report'}
                            </button>
                        </form>
                    </div>

                    {/* Community Reviews */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between border-b border-[#333] border-dashed pb-4">
                            <h2 className="text-2xl font-black tracking-tighter uppercase">Community Reviews</h2>
                            <div className="text-[10px] font-black text-blue-500">{reviews.length}REVIEWS</div>
                        </div>

                        <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                            {reviews.length > 0 ? (
                                reviews.map((review: any) => (
                                    <div key={review.id} className="border border-[#333] border-dashed p-6 bg-white/5 relative group">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-black text-[10px]">
                                                    {review.user?.name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black uppercase tracking-widest">{review.user?.name}</div>
                                                    <div className="text-[8px] text-white/30 uppercase tracking-[0.2em]">{new Date(review.created_at).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <div key={i} className={`w-1.5 h-1.5 ${i < review.rating ? 'bg-blue-600' : 'bg-white/10'}`}></div>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold text-white/60 leading-relaxed uppercase tracking-widest">
                                            "{review.content}"
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 flex flex-col items-center justify-center border border-[#333] border-dashed opacity-20">
                                    <span className="text-[10px] font-black tracking-[0.5em] uppercase">No_Reviews_Available</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommended For You Section */}
            {recommendations.length > 0 && (
                <div className="relative z-10 mt-16 pt-8 border-t border-[#333] border-dashed">
                    <h2 className="text-2xl font-black tracking-tighter uppercase mb-8">Recommended For You</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
                        {recommendations.slice(0, 5).map((recGame: any) => (
                            <Link href={`/games/${recGame.id}`} key={recGame.id} className="block group border border-[#333] border-dashed bg-black p-4 hover:border-blue-500 transition-colors">
                                <div className="absolute top-4 right-4 z-20 bg-blue-600 px-3 py-1 text-[8px] font-black tracking-[0.3em] uppercase text-white animate-pulse">
                                    RECOMMENDED
                                </div>
                                <div className="aspect-video mb-4 overflow-hidden border border-[#333] border-dashed bg-black/50 relative">
                                    <img
                                        src={recGame.banner_image || 'https://placehold.co/400x225/111/white?text=No+Image'}
                                        alt={recGame.title}
                                        className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                    />
                                </div>
                                <h3 className="font-black text-lg uppercase tracking-tight group-hover:text-blue-500 transition-colors">{recGame.title}</h3>
                                <div className="mt-2 text-[10px] text-white/50 tracking-widest uppercase">
                                    {recGame.recommendation_reason}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function GameDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black text-white flex items-center justify-center pt-24 pb-12">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        }>
            <GameDetailsContent id={id} />
        </Suspense>
    );
}
