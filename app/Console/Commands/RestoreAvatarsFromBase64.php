<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

class RestoreAvatarsFromBase64 extends Command
{
    protected $signature = 'avatars:restore';
    protected $description = 'Restore avatar files from base64 data';

    public function handle()
    {
        $this->info('🔄 Restoring avatars...');
        $count = 0;

        $users = User::whereNotNull('avatar')->get();

        foreach ($users as $user) {
            if (!$user->avatar_path || !Storage::disk('public')->exists($user->avatar_path)) {
                if (preg_match('/^data:image\/(\w+);base64,/', $user->avatar, $type)) {
                    $data = substr($user->avatar, strpos($user->avatar, ',') + 1);
                    $extension = strtolower($type[1]);
                    $data = base64_decode($data);
                    $filePath = "avatars/restored_{$user->id}." . $extension;
                    Storage::disk('public')->put($filePath, $data);
                    $user->update(['avatar_path' => $filePath]);
                    $count++;
                }
            }
        }

        $this->info("✅ {$count} avatar(s) restored.");
    }
}
