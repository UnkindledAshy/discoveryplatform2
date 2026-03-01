<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FavoritesController extends Controller

{
    public function index()
    {
        $user = Auth::user();
        $favorites = $user->favorites()->with('game')->get();
        return response()->json($favorites);
    }
     $response = Http::get("https://api.rawg.io/api/games/{$request->id}", [
            'key' => env('51ae123f5007407b899b5bbe8f52aa75'),
        ]);

    public function store(Request $request)
    {
        $user = Auth::user();
        $favorite = $user->favorites()->create([
            'game_id' => $request->id,
            'name' => $request->name,
            'rating' => $request->rating,
            'genre' => $request->genre,
            'platform' => $request->platform,
            'banner_image' => $request->banner_image,
            'review' => $request->review,
        ]);
        return response()->json($favorite);
    }

    public function show(Request $request)
    {
        $user = Auth::user();
        $favorite = $user->favorites()->where('game_id', $request->game_id)->first();
        return response()->json($favorite);
    }

    public function update(Request $request)
    {
        $user = Auth::user();
        $favorite = $user->favorites()->where('game_id', $request->game_id)->first();
        $favorite->update([
            'review' => $request->review,
        ]);
        return response()->json($favorite);
    }   

    public function destroy(Request $request)
    {
        $user = Auth::user();
        $favorite = $user->favorites()->where('game_id', $request->game_id)->first();
        $favorite->delete();
        return response()->json($favorite);
    }
}
