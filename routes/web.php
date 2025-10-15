    <?php

    use App\Http\Controllers\API\QrTokenController;
    use App\Http\Controllers\EskulController;
    use App\Http\Controllers\EventController;
    use App\Http\Middleware\VerifMurid;
    use Illuminate\Support\Facades\Route;
    use Inertia\Inertia;
    use App\Http\Controllers\ReportController;
    use App\Http\Controllers\MuridController;
    use App\Http\Controllers\AbsenController;
    use App\Http\Controllers\Admin\EskulControllerAdmin;
    use App\Http\Controllers\API\ScanQRController;
    use App\Http\Controllers\KehadiranController;
    use App\Http\Controllers\Admin\DashboardController;
    use App\Http\Controllers\Admin\UserManagementController;
    use App\Http\Controllers\OrangTua\OrangTuaGuruController;

   use App\Http\Controllers\Admin\AdminRiwayatKehadiranController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/admin/riwayat-kehadiran', function () {
        return inertia('Admin/RiwayatKehadiran');
    })->name('admin.kehadiran-riwayat');
});



    


Route::get('/parent-teacher/dashboard', [OrangTuaGuruController::class, 'dashboard'])->name('parent.dashboard');
Route::get('/parent-teacher/attendance-history', [OrangTuaGuruController::class, 'attendanceHistory']);
Route::get('/parent-teacher/students', [OrangTuaGuruController::class, 'studentList']);
Route::get('/parent-teacher/profile', function () {
        return Inertia::render('OrangTua/EditProfileOrtuGuru');
    })->name('parent.profile');
Route::get('/parent-teacher/scan-qr', [DashboardController::class, 'index1'])->name('admin.dashboard');


    Route::get('/admin/laporan-kehadiran', function () {          
    return Inertia::render('Admin/LaporanKehadiran');
})->name('laporan.kehadiran');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/murid/riwayat', function () {
        return inertia('RiwayatMurid/RiwayatPage');
    })->name('riwayat.index');
});
Route::post('/kehadiran/auto-checkout', [KehadiranController::class, 'autoCheckout']);


Route::middleware(['auth', 'verified'])->group(function () {
   
});

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/coba', function () {
    return Inertia::render('PageCoba');
})->name('coba');

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/Admin/Dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('/Admin/dashboard/export/{type}', [DashboardController::class, 'export'])->name('admin.dashboard.export');
    Route::get('/Admin/UserManagement', [UserManagementController::class, 'index'])->name('admin.user.management');
      Route::get('/Admin/UserDetail/{id}', [UserManagementController::class, 'detail'])
        ->name('admin.user.detail');

    Route::get('/Admin/UserDetail/{id}/edit', [UserManagementController::class, 'edit'])
        ->name('admin.user.edit');

    Route::put('/Admin/UserDetail/{id}', [UserManagementController::class, 'update'])
        ->name('admin.user.update');
});

// =================== Admin Event Management ===================
Route::prefix('admin')->name('admin.')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/events', [EventController::class, 'manageEvents'])->name('events.manage');
    Route::get('/events/create', fn () => Inertia::render('Admin/ManageEvents'))->name('events.create');
    Route::post('/events', [EventController::class, 'storeEvent'])->name('events.store');

    // Detail event untuk admin
    Route::get('/events/{event}', [EventController::class, 'adminDetailEvent'])->name('events.detail');
    Route::patch('/events/{event}', [EventController::class, 'updateEvent'])->name('events.update');

    Route::patch('/events/{event}/publish', [EventController::class, 'togglePublish'])->name('events.toggle-publish');
    Route::delete('/events/{event}', [EventController::class, 'destroy'])->name('events.destroy');
});

Route::prefix('admin')->name('admin.')->middleware(['auth','verified'])->group(function () {
    Route::get('/eskul', [EskulControllerAdmin::class, 'index'])->name('eskul.index');
    Route::post('/eskul', [EskulControllerAdmin::class, 'store'])->name('eskul.store');
    Route::get('/eskul/create', fn () => Inertia::render('Admin/AdminEskulCreate'))->name('eskul.create');
    Route::get('/eskul/{eskul}', [EskulControllerAdmin::class, 'show'])->name('eskul.show');
    Route::patch('/eskul/{eskul}', [EskulControllerAdmin::class, 'update'])->name('eskul.update');
    Route::delete('/eskul/{eskul}', [EskulControllerAdmin::class, 'destroy'])->name('eskul.destroy');

    // Jadwal / Absensi
    Route::get('/eskul/absensi', [EskulControllerAdmin::class, 'manageAbsensi'])->name('eskul.absensi');
    Route::get('/eskul/{eskul}/schedule', [EskulControllerAdmin::class, 'getSchedule'])->name('eskul.schedule');
    Route::post('/eskul/absensi/store', [EskulControllerAdmin::class, 'storeAbsensi'])->name('eskul.absensi.store');
    Route::delete('/eskul/absensi/{schedule}', [EskulControllerAdmin::class, 'deleteSchedule'])->name('eskul.absensi.delete');
});

// Statistik Kehadiran Admin
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/admin/statistik-kehadiran', function () {
        return Inertia::render('Admin/StatistikKehadiran');
    })->name('admin.statistik-kehadiran');
});





    

    Route::middleware(['auth:sanctum', 'verified'])->group(function () {
        Route::get('/events-dashboard', [EventController::class, 'scanPage'])->name('events.dashboard');
    });

    Route::middleware(['auth', 'verified'])->group(function () {
        Route::get('/murid/home', [MuridController::class, 'dashboard'])->name('murid.home');
        Route::get('/murid/home/qr/checkIn', [MuridController::class, 'index'])->name('murid.home.qr.checkIn');
        Route::get('/murid/home/qr/checkOut', [MuridController::class, 'index'])->name('murid.home.qr.checkOut');
    });
    Route::middleware(['auth', 'verified'])->group(function () {
        Route::get('/murid/eskul', [EskulController::class, 'index'])->name('murid.eskul');
        Route::get('/murid/eskul/kehadiran/{absensi}', [EskulController::class, 'kehadiranPage'])
        ->name('murid.eskul.kehadiran');
        Route::post('/murid/eskul/kehadiran/{absensi}', [EskulController::class, 'submitKehadiran'])
        ->name('murid.eskul.kehadiran.submit');
    });
        
    // routes/web.php (tambahkan di bawah semua route yang sudah ada)

    // web.php
    // web.php  (tambahkan setelah route /murid/eskul)
    Route::middleware(['auth'])->group(function () {
        // Murid routes
        Route::get('/murid/events', [EventController::class, 'index'])->name('events.index');
        Route::get('/murid/events/{id}/detailEvent', [EventController::class, 'detailEvent'])
            ->name('events.event-detail');
        Route::get('/murid/events/{event}/register', [EventController::class, 'showRegistrationForm'])->name('events.register.form');
        Route::post('/murid/events/{event}/register', [EventController::class, 'register'])->name('events.register');
        // Di web.php
        Route::post('/murid/events/{event}/qr', [EventController::class, 'generateQR'])
        ->name('events.qr') // Pastikan ada nama route
        ->middleware(['web', 'auth']);
        Route::get('/murid/events/{event}/confirmation', [EventController::class, 'showConfirmation'])->name('events.confirmation');
        Route::get('/events/{event}/qr', [EventController::class, 'showQR'])->name('events.qr.show');
    });

        

    Route::middleware(['auth', 'verified'])->group(function () {
    // Halaman Profile
    Route::get('/murid/profil', function () {
        return Inertia::render('ProfileMurid/PageProfile'); 
    })->name('profile');

    // Halaman Edit Profile
    Route::get('/murid/edit-profile', function () {
        return Inertia::render('ProfileMurid/EditProfile'); 
    })->name('profile.edit');
});
    // routes/web.php

    // Untuk peserta
    Route::get('/events/{event}', [EventController::class, 'detail'])
        ->middleware(['auth', 'verified'])
        ->name('events.detail');

    // Untuk panitia/admin
    Route::get('/events/{event}/scan', [EventController::class, 'scanPage'])
        ->middleware(['auth', 'verified', 'can:admin'])
        ->name('events.scan.page');

    Route::post('/events/scan', [EventController::class, 'scanQR'])
        ->middleware(['auth', 'verified', 'can:admin'])
        ->name('events.scan');
    require __DIR__.'/settings.php';
    require __DIR__.'/auth.php';
