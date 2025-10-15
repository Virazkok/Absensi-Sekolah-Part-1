<?php

namespace Database\Seeders;

use App\Models\Kelas;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class kelasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $classes = [
        ['name' => 'X IPA 1'],
        ['name' => 'X IPA 2'],
        ['name' => 'XI IPA 1'],
        ['name' => 'XI IPA 2'],
        ['name' => 'XII IPA 1'],
        
    ];

    foreach ($classes as $class) {
        Kelas::create($class);
        }
    }
}