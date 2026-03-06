<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GameSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminId = \App\Models\User::where('email', 'admin@example.com')->first()?->id ?? 1;
        $apiKey = env('RAWG_API_KEY', '51ae123f5007407b899b5bbe8f52aa75');

        // Fetch multiple pages of games to get a good library
        for ($page = 1; $page <= 2; $page++) {
            $response = \Illuminate\Support\Facades\Http::get('https://api.rawg.io/api/games', [
                'key' => $apiKey,
                'page' => $page,
                'page_size' => 20,
            ]);

            if ($response->failed()) {
                continue;
            }

            $games = $response->json()['results'] ?? [];

            foreach ($games as $gameData) {
                // Fetch full game details for description and developers
                $detailResponse = \Illuminate\Support\Facades\Http::get("https://api.rawg.io/api/games/{$gameData['id']}", [
                    'key' => $apiKey,
                ]);

                $details = $detailResponse->successful() ? $detailResponse->json() : [];

                \App\Models\Game::updateOrCreate(
                    ['rawg_id' => $gameData['id']],
                    [
                        'title' => $gameData['name'],
                        'description' => $details['description'] ?? "Released: {$gameData['released']} | Rating: {$gameData['rating']}",
                        'genre' => collect($gameData['genres'] ?? [])->pluck('name')->implode(', '),
                        'platform' => collect($gameData['platforms'] ?? [])->pluck('platform.name')->implode(', '),
                        'banner_image' => $gameData['background_image'],
                        'rating' => $gameData['rating'],
                        'released' => $gameData['released'],
                        'developers' => $details['developers'] ?? [],
                        'raw_genres' => $gameData['genres'] ?? [],
                        'raw_platforms' => $gameData['platforms'] ?? [],
                        'users' => $adminId,
                    ]
                );
            }
        }
    }
}
