<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    //Register (email, password, name, confirm_password)
    public function Register(Request $request){
        $fields = $request->validate([
            'name' => 'required|string',
            'email' => 'required|string|unique:users,email',
            'password' => 'required|string|confirmed'
        ]);

        $user = User::create([
            'name' => $fields['name'],
            'email' => $fields['email'],
            'password' => $fields['password']
        ]);

        $token = $user->createToken('myapptoken')->plainTextToken;

        $response = [
            'user' => $user,
            'token' => $token
        ];

        return response()->json($response, 201);


    }
    //Login (email, password)
    public function Login(Request $request){
        $fields = $request->validate([
            'email' => 'required|string',
            'password' => 'required|string'
        ]);

        //Check email
        $user = User::where('email', $fields['email'])->first();

        //Check password
        if(!$user || !Hash::check($fields['password'], $user->password)){
            return response([
                'message' => 'Bad credentials'
            ], 401);
        }

        $token = $user->createToken('myapptoken')->plainTextToken;

        $response = [
            'user' => $user,
            'token' => $token,
            'message' => 'User logged in successfully'
        ];

        return response()->json($response, 200);
    }
    //Profile
    public function Profile(){
        $user = auth()->user();
        return response()->json([
            'user' => $user,
            'message' => 'User profile retrieved successfully'
        ], 200);
    }
    //Logout
    public function logout(Request $request){
        $request->user()->currentAccessToken()->delete();

        return response([
            'message' => 'User logged out successfully'
        ], 200);
    }

    //Toggle Email Preferences
    public function toggleEmailPreference(Request $request){
        $user = auth()->user();
        $user->receives_recommendation_emails = !$user->receives_recommendation_emails;
        $user->save();
        return response()->json([
            'message' => 'Email preferences updated',
            'receives_recommendation_emails' => $user->receives_recommendation_emails
        ]);
    }
}
