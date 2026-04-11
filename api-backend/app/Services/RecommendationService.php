<?php

namespace App\Services;

use App\Models\Game;
use App\Models\User;

class RecommendationService
{
    /**
     * Get rule-based recommendations for a user.
     *
     * @param User $user
     * @return \Illuminate\Support\Collection
     */
    public function getRecommendations(User $user)
    {
        // 1. Get user interactions
        $favorites = $user->favorites()->get();
        $reviews = $user->reviews()->where('rating', '>=', 4)->with('game')->get();

        // Exclude games user has already favorited or reviewed
        $excludedIds = collect([])
            ->concat($favorites->pluck('id'))
            ->concat($user->reviews()->pluck('game_id'))
            ->filter()
            ->unique()
            ->values()
            ->toArray();

        $recommendations = [];

        // Strategy 1: Favorites-based recommendation (Shared genres or platforms)
        foreach ($favorites as $favorite) {
            if ($favorite->genre || $favorite->platform) {
                $query = Game::whereNotIn('id', $excludedIds);
                
                $query->where(function($q) use ($favorite) {
                    if ($favorite->genre) {
                        $q->orWhere('genre', $favorite->genre);
                    }
                    if ($favorite->platform) {
                        $q->orWhere('platform', $favorite->platform);
                    }
                });

                $games = $query->limit(10)->get();

                foreach ($games as $game) {
                    if (!isset($recommendations[$game->id])) {
                        // Fix undefined genre or platform formatting if missing
                        $genreDisplay = $favorite->genre ?? 'Unknown Genre';
                        $platformDisplay = $favorite->platform ?? 'Unknown Platform';
                        $game->recommendation_reason = "Because you favorited {$favorite->title} ({$genreDisplay}, {$platformDisplay})";
                        $game->recommendation_score = 1;
                        $recommendations[$game->id] = $game;
                    } else {
                        $recommendations[$game->id]->recommendation_score += 1;
                    }
                }
            }
        }

        // Strategy 2: Review-based similarity (Highly rated genres)
        foreach ($reviews as $review) {
            $reviewedGame = $review->game;
            if ($reviewedGame->genre) {
                $games = Game::whereNotIn('id', $excludedIds)
                    ->where('genre', $reviewedGame->genre)
                    ->orderByDesc('rating')
                    ->limit(10)
                    ->get();
                
                foreach ($games as $game) {
                    $reason = "Popular among users who like {$reviewedGame->genre} games";
                    if (!isset($recommendations[$game->id])) {
                        $game->recommendation_reason = $reason;
                        $game->recommendation_score = 2; // Slightly higher priority
                        $recommendations[$game->id] = $game;
                    } else {
                        // Override reason if it's better matched
                        $recommendations[$game->id]->recommendation_reason = $reason;
                        $recommendations[$game->id]->recommendation_score += 2;
                    }
                }
            }
        }

        // Sort by score
        $recommendations = collect($recommendations)->sortByDesc('recommendation_score')->values()->take(10);

        // Fallback: Pad recommendations if we have fewer than 5
        if ($recommendations->count() < 5) {
            $amountNeeded = 5 - $recommendations->count();
            
            // Add existing recommendations IDs to excluded list to avoid duplicates
            $excludedIds = array_merge($excludedIds, $recommendations->pluck('id')->toArray());

            $fallbackGames = Game::whereNotIn('id', $excludedIds)
                ->whereNotNull('rating')
                ->orderByDesc('rating')
                ->limit($amountNeeded)
                ->get();
            
            // If the local database doesn't have enough rated games, fetch popular ones from RAWG JIT
            if ($fallbackGames->count() < $amountNeeded) {
                $apiKey = env('RAWG_API_KEY', '51ae123f5007407b899b5bbe8f52aa75');
                $response = \Illuminate\Support\Facades\Http::get('https://api.rawg.io/api/games', [
                    'key' => $apiKey,
                    'ordering' => '-rating', // Best rated games
                    'page_size' => $amountNeeded
                ]);
                
                if ($response->successful()) {
                    $rawGames = $response->json()['results'] ?? [];
                    // Ensure the root admin user exists for associating seeded games
                    $adminUser = \App\Models\User::firstOrCreate(
                        ['email' => 'admin@example.com'],
                        ['name' => 'Admin', 'password' => bcrypt('password'), 'is_admin' => true]
                    );

                    foreach ($rawGames as $gameData) {
                        // Avoid duplicates if RAWG returns a game we already had
                        if (!in_array($gameData['id'], $excludedIds)) {
                            $fallbackGames->push(Game::updateOrCreate(
                                ['rawg_id' => $gameData['id']],
                                [
                                    'title' => $gameData['name'],
                                    'description' => "Release date: " . ($gameData['released'] ?? 'N/A'),
                                    'genre' => collect($gameData['genres'] ?? [])->pluck('name')->implode(', '),
                                    'platform' => collect($gameData['platforms'] ?? [])->pluck('platform.name')->implode(', '),
                                    'banner_image' => $gameData['background_image'],
                                    'rating' => $gameData['rating'],
                                    'released' => $gameData['released'],
                                    'raw_genres' => $gameData['genres'] ?? [],
                                    'raw_platforms' => $gameData['platforms'] ?? [],
                                    'users' => $adminUser->id,
                                ]
                            ));
                        }
                    }
                }
            }

            foreach($fallbackGames->take($amountNeeded) as $game) {
                $game->recommendation_reason = 'Trending this week';
                $recommendations->push($game);
            }
        }

        return $recommendations;
    }
}
