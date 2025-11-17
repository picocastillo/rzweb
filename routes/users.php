<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

Route::middleware(['auth', 'verified'])->prefix('users')->group(function () {
    // Listado
    Route::get('/', [UserController::class, 'index']);

    // Formulario de creación
    Route::get('/create', [UserController::class, 'create']);

    // Guardar nuevo usuario
    Route::post('/', [UserController::class, 'store']);

    // Formulario de edición
    Route::get('/{user}/edit', [UserController::class, 'edit']);

    // Actualizar usuario existente
    Route::put('/{user}', [UserController::class, 'update']);

    // Eliminar usuario
    Route::delete('/{user}', [UserController::class, 'destroy']);

    // Ver detalle (opcional)
    Route::get('/{user}', [UserController::class, 'show']);
});
