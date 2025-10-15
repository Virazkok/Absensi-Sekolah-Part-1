<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Eskul;

class EskulListController extends Controller
{
    public function list()
    {
        return response()->json(Eskul::select('id', 'nama')->get());
    }
}
