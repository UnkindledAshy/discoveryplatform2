<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\ReviewController;

Route::post('/register', [AuthController::class, 'Register']);
Route::post('/login', [AuthController::class, 'Login']);    

Route::group(['middleware'=> ['auth:sanctum']], function () {

    Route::apiResource('games', GameController::class);
    Route::apiResource('reviews', ReviewController::class);

    Route::get('/profile', [AuthController::class, 'Profile']);
    Route::get('/logout', [AuthController::class, 'Logout']);
});



//Route::get('/user', function (Request $request) {
//    return $request->user();
//})->middleware('auth:sanctum');
