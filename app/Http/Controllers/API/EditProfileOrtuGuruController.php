<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class EditProfileOrtuGuruController extends Controller
{
    public function me(Request $request)
    {
        $user = $request->user(); 
        return response()->json($user);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password_lama' => 'nullable|string',
            'password_baru' => 'nullable|min:6',
            'avatar' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $user->email = $request->email;

        // Cek password lama
        if ($request->filled('password_baru')) {
            if (!$request->filled('password_lama') || !Hash::check($request->password_lama, $user->password)) {
                return response()->json([
                    'message' => 'Password lama tidak sesuai'
                ], 422);
            }
            $user->password = Hash::make($request->password_baru);
        }

        // Avatar simpan base64
        if ($request->hasFile('avatar')) {
            $image = $request->file('avatar');
            $base64 = 'data:image/' . $image->getClientOriginalExtension() . ';base64,' . base64_encode(file_get_contents($image));
            $user->avatar = $base64;
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }
}
