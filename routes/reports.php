<?php

use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('reports')->group(function () {
    // Listado
    Route::get('/', [ReportController::class, 'index']);

    // Descargar PDF del informe (general o diario)
    Route::get('/pdf', [ReportController::class, 'pdf'])->name('reports.pdf');

    // // Formulario de creación
    // Route::get('/create', [ReportController::class, 'create']);

    // // Guardar nuevo report
    // Route::post('/', [ReportController::class, 'store']);

    // // Formulario de edición
    // Route::get('/{report}/edit', [ReportController::class, 'edit']);

    // // Actualizar report existente
    // Route::put('/{report}', [ReportController::class, 'update']);

    // // Eliminar reporte
    // Route::delete('/{report}', [ReportController::class, 'destroy']);

    // // Ver detalle (opcional)
    // Route::get('/{report}', [ReportController::class, 'show']);
});
