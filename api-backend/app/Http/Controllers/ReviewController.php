<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    /**
     * Display all reviews for a specific game.
     */
    public function index(Request $request)
    {
        $query = Review::with('user')->latest();

        if ($request->has('game_id')) {
            $query->where('game_id', $request->game_id);
        } else {
            // If no game_id, return user's own reviews
            $query->where('user_id', Auth::id())->with('game');
        }

        return response()->json($query->get());
    }

    /**
     * Store a newly created review.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'game_id' => 'required|exists:games,id',
            'content' => 'required|string',
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $review = Review::create([
            'user_id' => Auth::id(),
            'game_id' => $validated['game_id'],
            'content' => $validated['content'],
            'rating' => $validated['rating'],
        ]);

        return response()->json([
            'message' => 'Review saved successfully',
            'review' => $review->load(['user', 'game'])
        ], 201);
    }

    /**
     * Update the specified review.
     */
    public function update(Request $request, Review $review)
    {
        if ($review->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'content' => 'required|string',
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $review->update($validated);

        return response()->json([
            'message' => 'Review updated successfully',
            'review' => $review->load(['user', 'game'])
        ]);
    }

    /**
     * Remove the specified review.
     */
    public function destroy(Review $review)
    {
        if ($review->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $review->delete();

        return response()->json(['message' => 'Review deleted successfully']);
    }
}
