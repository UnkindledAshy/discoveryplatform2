<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FavoriteController extends Controller
{
    /**
     * Display a listing of the user's favorites.
     */
    public function index()
    {
        $favorites = Auth::user()->favorites()->latest()->get();
        return response()->json($favorites);
    }

    /**
     * Store (toggle) a favorite.
     */
    public function store(Request $request)
    {
        $request->validate([
            'game_id' => 'required|exists:games,id',
        ]);

        $user = Auth::user();
        $gameId = $request->game_id;

        // Toggle logic
        if ($user->favorites()->where('game_id', $gameId)->exists()) {
            $user->favorites()->detach($gameId);
            $status = false;
        } else {
            $user->favorites()->attach($gameId);
            $status = true;
        }

        return response()->json([
            'is_favorite' => $status,
            'message' => $status ? 'Game added to favorites' : 'Game removed from favorites'
        ]);
    }

    /**
     * Check if a game is favorited.
     */
    public function show($gameId)
    {
        $isFavorite = Auth::user()->favorites()->where('game_id', $gameId)->exists();
        return response()->json(['is_favorite' => $isFavorite]);
    }
}
