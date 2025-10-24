<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\Kehadiran;
use App\Models\Murid;
use Carbon\Carbon;


Schedule::command('kehadiran:auto-checkout')
    ->dailyAt('16:41'); // setiap jam 17:05 jalan
Schedule::command('avatars:restore'); 



