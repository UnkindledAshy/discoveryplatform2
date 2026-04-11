<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GameController extends Controller
{
    public function index(Request $request)
    {
        $apiKey = env('RAWG_API_KEY', '51ae123f5007407b899b5bbe8f52aa75');
        $adminUser = \App\Models\User::firstOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'Admin', 'password' => bcrypt('password'), 'is_admin' => true]
        );
        $adminId = $adminUser->id;
        // 1. Fetch from RAWG to sync DB (Just-In-Time Seeding)
        $rawgParams = [
            'key' => $apiKey,
            'page' => $request->get('page', 1),
            'page_size' => $request->get('page_size', 12),
        ];

        if ($request->has('search')) $rawgParams['search'] = $request->search;
        if ($request->has('genres') && $request->genres !== 'all') $rawgParams['genres'] = $request->genres;
        if ($request->has('platforms') && $request->platforms !== 'all') $rawgParams['platforms'] = $request->platforms;

        $response = \Illuminate\Support\Facades\Http::get('https://api.rawg.io/api/games', $rawgParams);

        if ($response->successful()) {
            $rawGames = $response->json()['results'] ?? [];
            foreach ($rawGames as $gameData) {
                \App\Models\Game::updateOrCreate(
                    ['rawg_id' => $gameData['id']],
                    [
                        'title' => $gameData['name'],
                        'description' => "Release date: {$gameData['released']}",
                        'genre' => collect($gameData['genres'] ?? [])->pluck('name')->implode(', '),
                        'platform' => collect($gameData['platforms'] ?? [])->pluck('platform.name')->implode(', '),
                        'banner_image' => $gameData['background_image'],
                        'rating' => $gameData['rating'],
                        'released' => $gameData['released'],
                        'raw_genres' => $gameData['genres'] ?? [],
                        'raw_platforms' => $gameData['platforms'] ?? [],
                        'users' => $adminId,
                    ]
                );
            }
        }

        // 2. Query Local DB after sync
        $query = \App\Models\Game::query();

        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        if ($request->has('genres') && $request->genres !== 'all') {
            $genreFilter = $request->genres;
            $query->where(function($q) use ($genreFilter) {
                $q->where('raw_genres', 'like', '%"slug":"' . $genreFilter . '"%')
                  ->orWhere('raw_genres', 'like', '%"slug": "' . $genreFilter . '"%')
                  ->orWhere('raw_genres', 'like', '%"id":' . $genreFilter . ',%')
                  ->orWhere('raw_genres', 'like', '%"id": ' . $genreFilter . ',%')
                  ->orWhere('raw_genres', 'like', '%"id":' . $genreFilter . '}%')
                  ->orWhere('raw_genres', 'like', '%"id": ' . $genreFilter . '}%')
                  ->orWhere('genre', 'like', '%' . $genreFilter . '%');
            });
        }

        if ($request->has('platforms') && $request->platforms !== 'all') {
            $platformId = $request->platforms;
            $query->where(function($q) use ($platformId) {
                $q->where('raw_platforms', 'like', '%"id":' . $platformId . '%')
                  ->orWhere('raw_platforms', 'like', '%"id": ' . $platformId . '%')
                  ->orWhere('platform', 'like', '%' . $platformId . '%');
            });
        }

        $games = $query->paginate(12);

        // Get unique genres and platforms for filters from the DB
        $genres = \App\Models\Game::whereNotNull('raw_genres')->select('raw_genres')->get()
            ->pluck('raw_genres')
            ->flatten(1)
            ->unique('id')
            ->values();

        $platforms = \App\Models\Game::whereNotNull('raw_platforms')->select('raw_platforms')->get()
            ->pluck('raw_platforms')
            ->flatten(1)
            ->unique('platform.id')
            ->map(fn($p) => $p['platform'])
            ->values();

        return response()->json([
            'data' => $games->items(),
            'current_page' => $games->currentPage(),
            'last_page' => $games->lastPage(),
            'total' => $games->total(),
            'genres' => $genres,
            'platforms' => $platforms,
        ]);
    }

    public function show($id)
    {
        $game = \App\Models\Game::find($id);

        if (!$game) {
            // JIT Fetch for single game if not found by local ID
            $game = \App\Models\Game::where('rawg_id', $id)->first();
        }

        // Hydrate full details if we only have the index/list summary
        $isPlaceholder = $game && (
            str_starts_with($game->description, 'Release date: ') ||
            str_starts_with($game->description, 'Released: ') ||
            strlen($game->description) < 100 // RAWG descriptions are usually much longer
        );

        if (!$game || $isPlaceholder) {
            $apiKey = env('RAWG_API_KEY', '51ae123f5007407b899b5bbe8f52aa75');
            $adminUser = \App\Models\User::firstOrCreate(
                ['email' => 'admin@example.com'],
                ['name' => 'Admin', 'password' => bcrypt('password'), 'is_admin' => true]
            );
            $adminId = $adminUser->id;
            $rawgId = $game ? $game->rawg_id : $id;
            $response = \Illuminate\Support\Facades\Http::get("https://api.rawg.io/api/games/{$rawgId}", [
                'key' => $apiKey
            ]);

            if ($response->successful()) {
                $details = $response->json();
                $game = \App\Models\Game::updateOrCreate(
                    ['rawg_id' => $details['id']],
                    [
                        'title' => $details['name'],
                        'description' => $details['description'] ?? "Release date: {$details['released']}",
                        'genre' => collect($details['genres'] ?? [])->pluck('name')->implode(', '),
                        'platform' => collect($details['platforms'] ?? [])->pluck('platform.name')->implode(', '),
                        'banner_image' => $details['background_image'],
                        'rating' => $details['rating'],
                        'released' => $details['released'],
                        'developers' => $details['developers'] ?? [],
                        'raw_genres' => $details['genres'] ?? [],
                        'raw_platforms' => $details['platforms'] ?? [],
                        'users' => $adminId,
                    ]
                );
            }
        }

        if (!$game) {
            return response()->json(['message' => 'Game not found'], 404);
        }

        return response()->json($game);
    }
}
