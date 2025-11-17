<?php
use \App\Models\Task;
use Illuminate\Support\Facades\Log;


const STATES = [
    'Iniciada', //0
    'Asignada', //1
    'En curso', //2
    'Finalizada', //3
];

const TYPE_MOVEMENT = [
    'Regreso Por Orden',//0
    'Alta Stock',//1
    'Salida Por Orden'//2
];

const ROLES = [
    1 => 'Admin',
    2 => 'Trabajador',
];


function logg($n){
    Log::debug($n);
}
function getNameTypeMovement($idx){ return TYPE_MOVEMENT[$idx];}
function getNameStateOrder($idx){ return STATES[$idx];}
function getNameRoleUser($idx){ return ROLES[$idx];}


