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

        $games = [
            ['title' => 'Cyberpunk 2077', 'genre' => 'RPG', 'platform' => 'PC', 'cost' => 60, 'description' => 'Night City changes every body.', 'users' => $adminId],
            ['title' => 'Elden Ring', 'genre' => 'RPG', 'platform' => 'PlayStation', 'cost' => 70, 'description' => 'Rise, Tarnished.', 'users' => $adminId],
            ['title' => 'Valorant', 'genre' => 'Shooter', 'platform' => 'PC', 'cost' => 0, 'description' => 'Defy the limits.', 'users' => $adminId],
            ['title' => 'FIFA 24', 'genre' => 'Sports', 'platform' => 'Xbox', 'cost' => 60, 'description' => 'The worlds game.', 'users' => $adminId],
            ['title' => 'Starfield', 'genre' => 'RPG', 'platform' => 'PC', 'cost' => 70, 'description' => 'To the stars.', 'users' => $adminId],
            ['title' => 'God of War Ragnarok', 'genre' => 'Action', 'platform' => 'PlayStation', 'cost' => 70, 'description' => 'Fimbulwinter is here.', 'users' => $adminId],
            ['title' => 'Spider-Man 2', 'genre' => 'Action', 'platform' => 'PlayStation', 'cost' => 70, 'description' => 'Be greater together.', 'users' => $adminId],
            ['title' => 'Halo Infinite', 'genre' => 'Shooter', 'platform' => 'Xbox', 'cost' => 60, 'description' => 'Become the Master Chief.', 'users' => $adminId],
            ['title' => 'Forza Horizon 5', 'genre' => 'Sports', 'platform' => 'Xbox', 'cost' => 60, 'description' => 'The ultimate driving adventure.', 'users' => $adminId],
            ['title' => 'Final Fantasy XVI', 'genre' => 'RPG', 'platform' => 'PlayStation', 'cost' => 70, 'description' => 'Awaken the eikon.', 'users' => $adminId],
            ['title' => 'Street Fighter 6', 'genre' => 'Action', 'platform' => 'PC', 'cost' => 60, 'description' => 'The path to strength.', 'users' => $adminId],
        ];

        foreach ($games as $game) {
            \App\Models\Game::create($game);
        }
    }
}
