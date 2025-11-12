<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ProductController;

Route::middleware(['auth', 'verified'])->prefix('products')->group(function () {

    Route::get('/', [ProductController::class, 'index']);

    Route::get('/create', [ProductController::class, 'create']);

    Route::post('/', [ProductController::class, 'store']);

    Route::get('/{product}/edit', [ProductController::class, 'edit']);

    Route::put('/{product}', [ProductController::class, 'update']);

    Route::delete('/{product}', [ProductController::class, 'destroy']);

    Route::get('/{product}', [ProductController::class, 'show']);

    Route::post('/{product}/add-stock', [ProductController::class, 'addStock']);

    Route::post('/{product}/add-cost', [ProductController::class, 'addCost']);
    
});
