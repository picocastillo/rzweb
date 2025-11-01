<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\BillController;

Route::middleware(['auth', 'verified'])->prefix('bills')->group(function () {
    // Listado
    Route::get('/', [BillController::class, 'index']);

    // Formulario de creación
    Route::get('/create', [BillController::class, 'create']);

    // Guardar nuevo bill
    Route::post('/', [BillController::class, 'store']);

    // Formulario de edición
    Route::get('/{bill}/edit', [BillController::class, 'edit']);

    // Actualizar bill existente
    Route::put('/{bill}', [BillController::class, 'update']);

    // Eliminar bille
    Route::delete('/{bill}', [BillController::class, 'destroy']);

    // Ver detalle (opcional)
    Route::get('/{bill}', [BillController::class, 'show']);
});
