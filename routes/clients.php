<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ClientController;

Route::middleware(['auth', 'verified'])->prefix('clients')->group(function () {
    // Listado
    Route::get('/', [ClientController::class, 'index']);

    // Formulario de creación
    Route::get('/create', [ClientController::class, 'create']);

    // Guardar nuevo cliente
    Route::post('/', [ClientController::class, 'store']);

    // Formulario de edición
    Route::get('/{client}/edit', [ClientController::class, 'edit']);

    // Actualizar cliente existente
    Route::put('/{client}', [ClientController::class, 'update']);

    // Eliminar cliente
    Route::delete('/{client}', [ClientController::class, 'destroy']);

    // Ver detalle (opcional)
    Route::get('/{client}', [ClientController::class, 'show']);
});
