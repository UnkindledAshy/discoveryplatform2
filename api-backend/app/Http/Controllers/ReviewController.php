<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    /**
     * Display a listing of the authenticated user's reviews.
     */
    public function index()
    {
        $reviews = Auth::user()->reviews()->with('game')->latest()->get();
        return response()->json($reviews);
    }

    /**
     * Store a newly created review in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'game_id' => 'required|exists:games,id',
            'content' => 'required|string',
            'rating' => 'required|integer|min:1|max:5',
            'description' => 'required|string',
            'user_id' => 'required|exists:users,id',
        ]);

        $review = Auth::user()->reviews()->create($validated);

        return response()->json([
            'message' => 'Review posted successfully',
            'review' => $review->load('game')
        ], 201);
    }

    /**
     * Display the specified review.
     */
    public function show(Review $review)
    {
        return response()->json($review->load('game', 'user'));
    }

    /**
     * Update the specified review in storage.
     */
    public function update(Request $request, Review $review)
    {
        if ($review->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'content' => 'required|string',
            'rating' => 'required|integer|min:1|max:5',
            'description' => 'required|string',
            'user_id' => 'required|exists:users,id',
        ]);

        $review->update($validated);

        return response()->json([
            'message' => 'Review updated successfully',
            'review' => $review->load('game')
        ]);
    }

    /**
     * Remove the specified review from storage.
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
