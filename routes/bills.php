<?php

use App\Http\Controllers\BillController;
use Illuminate\Support\Facades\Route;

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

    // Descargar PDF de la factura
    Route::get('/{bill}/pdf', [BillController::class, 'pdf'])->name('bills.pdf');

    // Ver detalle (opcional)
    Route::get('/{bill}', [BillController::class, 'show']);
});
