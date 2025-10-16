<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrderController;

Route::middleware(['auth', 'verified'])->prefix('orders')->group(function () {

    Route::get('/', [OrderController::class, 'index']);

    Route::get('/create', [OrderController::class, 'create']);

    Route::post('/', [OrderController::class, 'store']);

    Route::get('/{order}/edit', [OrderController::class, 'edit']);

    Route::put('/{order}', [OrderController::class, 'update']);

    Route::delete('/{order}', [OrderController::class, 'destroy']);

    Route::get('/{order}', [OrderController::class, 'show']);

    Route::post('/{order}/add-stock', [OrderController::class, 'addStock']);
    
});
