<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class VerifMurid
{
    public function handle($request, Closure $next)
    {
        if (!Auth::check()) {
            return redirect('/login');
        }

        if (!Auth::user()->is_murid) {
            return redirect('/murid/dashboard'); // ✅ route yang tidak pakai VerifMurid
        }

        
    }
}