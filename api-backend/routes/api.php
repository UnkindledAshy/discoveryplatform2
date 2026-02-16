<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;

Route::post('/register', [AuthController::class, 'Register']);
Route::post('/login', [AuthController::class, 'Login']);    

Route::group(['middleware'=> ['auth:sanctum']], function () {

    Route::apiResource('products', ProductController::class);

    Route::get('/profile', [AuthController::class, 'Profile']);
    Route::get('/logout', [AuthController::class, 'Logout']);
});



//Route::get('/user', function (Request $request) {
//    return $request->user();
//})->middleware('auth:sanctum');
