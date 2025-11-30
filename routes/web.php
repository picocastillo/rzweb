<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\OrderController;



// Auth::routes(['register' => false, 'reset' => false]);

Route::get('/', function () {
    return Inertia::render('auth/login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');
});

// Route::middleware(['auth', 'verified'])->group(function () {
//     Route::get('order', [OrderController::class, 'index']);
// });

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/clients.php';
require __DIR__.'/products.php';
require __DIR__.'/orders.php';
require __DIR__.'/bills.php';
require __DIR__.'/users.php';