<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrderController;

Route::middleware(['auth', 'verified'])->prefix('orders')->group(function () {

    Route::get('/worker', [OrderController::class, 'indexForWorkers']);

    Route::get('/', [OrderController::class, 'index']);
    Route::get('/create', [OrderController::class, 'create']);
    Route::post('/', [OrderController::class, 'store']);
    Route::post('/{order}/start', [OrderController::class, 'initOrder']);
    Route::post('/{order}/finish', [OrderController::class, 'finishOrder']);

    Route::get('/{order}/edit', [OrderController::class, 'edit']);
    Route::put('/{order}', [OrderController::class, 'update']);
    Route::delete('/{order}', [OrderController::class, 'destroy']);
    Route::get('/{order}', [OrderController::class, 'show']);

    Route::post('/{order}/add-stock', [OrderController::class, 'addStock']);
    Route::post('/{order}/stock-movement', [OrderController::class, 'stockMovement']);
    Route::post('/{order}/assign', [OrderController::class, 'assignOrder']);

    Route::post('{order}/note', [OrderController::class, 'addNote']);
    Route::put('/{order}/note/{note}', [OrderController::class, 'updateNote']);

    Route::post('{order}/file', [OrderController::class, 'attachFile']);
    Route::delete('/{order}/file/{file}', [OrderController::class, 'deleteFile']);
    
});
