<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\RecommendationController;


Route::post('/register', [AuthController::class, 'Register']);
Route::post('/login', [AuthController::class, 'Login']);    

Route::apiResource('games', GameController::class);
Route::get('games/{id}', [GameController::class, 'show']);

Route::group(['middleware'=> ['auth:sanctum']], function () {
    Route::apiResource('reviews', ReviewController::class);
    Route::apiResource('favorites', FavoriteController::class);
    Route::get('recommendations', [RecommendationController::class, 'index']);

    Route::get('/profile', [AuthController::class, 'Profile']);
    Route::post('/user/email-preferences', [AuthController::class, 'toggleEmailPreference']);
    Route::get('/logout', [AuthController::class, 'Logout']);
});



//Route::get('/user', function (Request $request) {
//    return $request->user();
//})->middleware('auth:sanctum');
