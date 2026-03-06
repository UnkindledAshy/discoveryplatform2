'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Game {
    id: number;
    title: string;
}

interface Review {
    id: number;
    game_id: number;
    content: string;
    rating: number;
    created_at: string;
    game: Game;
}

interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
    is_admin: boolean;
}

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingReview, setEditingReview] = useState<Review | null>(null);
    const [editContent, setEditContent] = useState('');
    const [editRating, setEditRating] = useState(5);
    const [activeTab, setActiveTab] = useState<'reviews' | 'favorites'>('reviews');
    const [favorites, setFavorites] = useState<{ id: number; title: string; platform: string }[]>([]);
    const router = useRouter();

    const handleAvatarUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: any) => {
            const file = e.target.files[0];
            if (file) {
                alert(`INITIALIZING_UPLOAD: ${file.name}\n(INTEGRATION_PENDING_BACKEND)`);
            }
        };
        input.click();
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        const fetchProfileData = async () => {
            try {
                const profileRes = await api.get('/profile');
                const userData = profileRes.data.user || profileRes.data;
                setUser(userData);

                const reviewsRes = await api.get('/reviews');
                setReviews(reviewsRes.data);

                const favoritesRes = await api.get('/favorites');
                setFavorites(favoritesRes.data);
            } catch (err) {
                console.error('Failed to load profile data', err);
                if ((err as any).response?.status === 401) {
                    localStorage.removeItem('token');
                    router.push('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [router]);

    const handleDelete = async (id: number) => {
        if (!confirm('CONFIRM_DELETION_OF_ENTRY?')) return;
        try {
            await api.delete(`/reviews/${id}`);
            setReviews(reviews.filter(r => r.id !== id));
        } catch (err) {
            alert('ERR_DELETION_FAILED');
        }
    };

    const handleRemoveFavorite = async (gameId: number) => {
        if (!confirm('REMOVE_GAME_FROM_YOUR_COLLECTION?')) return;
        try {
            await api.post('/favorites', { game_id: gameId });
            setFavorites(favorites.filter(f => f.id !== gameId));
        } catch (err) {
            alert('ERR_REMOVAL_FAILED');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingReview) return;

        try {
            const response = await api.put(`/reviews/${editingReview.id}`, {
                content: editContent,
                rating: editRating
            });
            // The backend now returns the review with user and game loaded
            const updatedReview = response.data.review;
            setReviews(reviews.map(r => r.id === editingReview.id ? updatedReview : r));
            setEditingReview(null);
        } catch (err) {
            alert('ERR_UPDATE_FAILED');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center font-black text-blue-600">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border border-[#333] border-dashed animate-spin"></div>
                    <span className="tracking-[0.4em] uppercase text-[10px]">Synchronizing_Profile...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-24 px-8 md:px-16 overflow-hidden">
            <div className="absolute inset-0 dashed-grid opacity-10 pointer-events-none"></div>

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Profile Header Block */}
                <div className="flex flex-col md:flex-row gap-0 border border-[#333] border-dashed bg-black mb-16 relative group">
                    <div className="md:w-1/3 aspect-square md:aspect-auto md:h-80 border-b md:border-b-0 md:dashed-border-r border-[#333] border-dashed flex items-center justify-center bg-blue-600 relative overflow-hidden">
                        <span className="text-9xl font-black text-white select-none">
                            {user?.name?.charAt(0).toUpperCase()}
                        </span>

                        <button
                            onClick={handleAvatarUpload}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center flex-col gap-2"
                        >
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-[8px] font-black uppercase tracking-[0.3em]">Change_Avatar</span>
                        </button>
                    </div>
                    <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
                        <div className="inline-block w-fit px-3 py-1 mb-4 border border-blue-600 border-dashed text-[10px] uppercase tracking-[0.3em] font-black text-blue-500">
                            {user?.is_admin ? 'ADMIN_ACCOUNT' : 'USER_ACCOUNT'}
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 uppercase leading-none">
                            {user?.name}<span className="text-blue-600">.</span>
                        </h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-[#333] border-dashed pt-8">
                            <div className="space-y-4">
                                <div>
                                    <span className="block text-[8px] uppercase font-black text-white/20 tracking-[0.3em] mb-1">Display Name</span>
                                    <span className="text-xl font-black uppercase tracking-widest text-blue-500">{user?.name}</span>
                                </div>
                                <div className="pt-4 border-t border-[#333] border-dashed">
                                    <span className="block text-[8px] uppercase font-black text-white/20 tracking-[0.3em] mb-1">Email</span>
                                    <span className="text-sm font-bold uppercase tracking-widest text-white/60">{user?.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Section */}
                <div>
                    <div className="flex items-center gap-8 mb-12 border-b border-[#333] border-dashed pb-0">
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`pb-8 text-2xl font-black tracking-tighter uppercase transition-all relative ${activeTab === 'reviews' ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
                        >
                            Reviews
                            {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('favorites')}
                            className={`pb-8 text-2xl font-black tracking-tighter uppercase transition-all relative ${activeTab === 'favorites' ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
                        >
                            Favorites
                            {activeTab === 'favorites' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600"></div>}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-[#333] border-dashed">
                        {activeTab === 'reviews' ? (
                            reviews.length === 0 ? (
                                <div className="col-span-full py-32 flex flex-col items-center justify-center border-r border-b border-[#333] border-dashed">
                                    <h3 className="text-xl font-black text-white/20 uppercase tracking-[0.4em]">NO_REVIEWS_RECORDED</h3>
                                </div>
                            ) : (
                                reviews.map((review) => (
                                    <div key={review.id} className="relative border-r border-b border-[#333] border-dashed p-8 hover:bg-white/5 transition-all group">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] text-blue-500 font-black uppercase tracking-[0.3em] mb-1">Review #{review.id}</span>
                                                <h3 className="font-black text-lg uppercase tracking-tight group-hover:text-blue-500 transition-colors">{review.game.title}</h3>
                                            </div>
                                            <div className="flex bg-black border border-[#333] border-dashed">
                                                <button
                                                    onClick={() => {
                                                        setEditingReview(review);
                                                        setEditContent(review.content);
                                                        setEditRating(review.rating);
                                                    }}
                                                    className="p-2 hover:bg-blue-600 hover:text-white transition-all dashed-border-r text-white/40"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(review.id)}
                                                    className="p-2 hover:bg-red-600 hover:text-white transition-all text-white/40"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex gap-1 mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className={`w-2 h-2 ${i < review.rating ? 'bg-blue-600' : 'bg-white/10'}`}></div>
                                            ))}
                                        </div>

                                        <p className="text-white/50 text-xs font-medium leading-relaxed mb-8 uppercase tracking-widest line-clamp-4">"{review.content}"</p>

                                        <div className="flex items-center justify-between pt-6 border-t border-[#333] border-dashed">
                                            <span className="text-[8px] uppercase font-black text-white/20 tracking-[0.2em]">
                                                VERIFIED: {new Date(review.created_at).toLocaleDateString()}
                                            </span>
                                            <div className="w-2 h-2 bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]"></div>
                                        </div>
                                    </div>
                                ))
                            )
                        ) : (
                            favorites.length === 0 ? (
                                <div className="col-span-full py-32 flex flex-col items-center justify-center border-r border-b border-[#333] border-dashed">
                                    <h3 className="text-xl font-black text-white/20 uppercase tracking-[0.4em]">NO_FAVORITES_RECORDED</h3>
                                </div>
                            ) : (
                                favorites.map((game: any) => (
                                    <div key={game.id} className="relative border-r border-b border-[#333] border-dashed p-8 hover:bg-white/5 transition-all group">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] text-blue-500 font-black uppercase tracking-[0.3em] mb-1">Game ID #{game.id}</span>
                                                <h3 className="font-black text-lg uppercase tracking-tight group-hover:text-blue-500 transition-colors uppercase">{game.title}</h3>
                                            </div>
                                            <div className="flex bg-black border border-[#333] border-dashed">
                                                <button
                                                    onClick={() => router.push(`/games/${game.id}`)}
                                                    className="p-2 hover:bg-blue-600 hover:text-white transition-all dashed-border-r text-white/40"
                                                    title="View Details"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveFavorite(game.id)}
                                                    className="p-2 hover:bg-red-600 hover:text-white transition-all text-white/40"
                                                    title="Remove from Favorites"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="aspect-video mb-6 overflow-hidden border border-[#333] border-dashed bg-black/50">
                                            <img
                                                src={game.banner_image || 'https://placehold.co/400x225/111/white?text=No+Image'}
                                                alt={game.title}
                                                className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                            />
                                        </div>
                                        <button
                                            onClick={() => router.push(`/games/${game.id}`)}
                                            className="w-full py-3 border border-[#333] border-dashed text-[8px] uppercase font-black tracking-widest hover:bg-white hover:text-black transition-all"
                                        >
                                            Launch_Intel_Portal
                                        </button>
                                    </div>
                                ))
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Modal (Industrial Style) */}
            {editingReview && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-sm">
                    <div className="bg-black border border-[#333] border-dashed w-full max-w-md p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-[#333] border-dashed m-4"></div>
                        <h2 className="text-3xl font-black mb-12 tracking-tighter uppercase">Modify_Entry</h2>
                        <form onSubmit={handleUpdate} className="space-y-8">
                            <div>
                                <label className="block text-[8px] uppercase font-black text-white/30 tracking-[0.2em] mb-4">Update Score</label>
                                <div className="flex justify-between gap-1">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => setEditRating(num)}
                                            className={`flex-1 py-4 font-black text-sm border border-[#333] border-dashed transition-all ${num <= editRating
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-transparent text-white/20 hover:bg-white/5'
                                                }`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[8px] uppercase font-black text-white/30 tracking-[0.2em] mb-4">Edit Narrative</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full bg-transparent border border-[#333] border-dashed p-6 text-[10px] font-bold uppercase tracking-[0.2em] outline-none focus:bg-blue-600/5 transition-all resize-none text-white/80"
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    className="flex-[2] py-4 bg-blue-600 text-white text-[10px] uppercase tracking-widest font-black hover:bg-blue-700 transition-all border border-transparent"
                                >
                                    COMMIT_CHANGES
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingReview(null)}
                                    className="flex-1 py-4 border border-[#333] border-dashed text-white/40 text-[10px] uppercase tracking-widest font-black hover:text-white transition-all"
                                >
                                    CANCEL
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
