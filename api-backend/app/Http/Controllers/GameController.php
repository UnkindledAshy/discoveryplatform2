<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GameController extends Controller
{
    public function index(Request $request)
    {
        $params = array_merge($request->all(), [
            'key' => env('RAWG_API_KEY', '51ae123f5007407b899b5bbe8f52aa75'),
        ]);

        $games = Http::get('https://api.rawg.io/api/games', $params);
        $gamedetails = Http::get('https://api.rawg.io/api/games/{id}', $params);
        $genres = Http::get('https://api.rawg.io/api/genres', $params);
        $platforms = Http::get('https://api.rawg.io/api/platforms', $params);

        return response()->json([
            'games' => $games->json(),
            'gamedetails' => $gamedetails->json(),
            'genres' => $genres->json(),
            'platforms' => $platforms->json(),
        ]);
    }

    public function show($id)
    {
        $response = Http::get("https://api.rawg.io/api/games/{$id}", [
            'key' => env('RAWG_API_KEY', '51ae123f5007407b899b5bbe8f52aa75'),
        ]);

        if ($response->failed()) {
            return response()->json(['message' => 'Game not found'], 404);
        }

        return response()->json($response->json());
    }
}
