<?php

use App\Http\Controllers\AdminConfigurationController;
use App\Http\Controllers\AdminPanel;
use App\Http\Controllers\AppointmentForm;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\HealthinsurancesController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::get('/healthinsurances', [AppointmentForm::class, 'getHealthInsurances']);
Route::get('/planes/{id}', [AppointmentForm::class, 'getPlanes']);
Route::get('/specialties', [AppointmentForm::class, 'getSpecialties']);
Route::get('/doctors/{id}', [AppointmentForm::class, 'getDoctorsBySpeciality'])->name('getDoctorsBySpeciality');
Route::post('/doctors/{doctorId}/upload-image', [AppointmentForm::class, 'uploadImage']);

Route::get('/dateTime/{id?}/{specialtyId?}', [AppointmentForm::class, 'getDateTimeByDoctor'])->name('getDateTimeByDoctor');
Route::get('/personalInfo/{dni}', [AppointmentForm::class, 'getPersonalInfoByDni'])->name('getPersonalInfoByDni');
Route::post('/turno/confirmacions', [AppointmentForm::class, 'postTurno'])->name('postTurno');
Route::post('/person/store', [AppointmentForm::class, 'postPersona'])->name('postPersona');
Route::post('/put/turno/{id}', [AppointmentForm::class, 'putCancelTurno']);
Route::get('/cancelar/turno/{id}', [AppointmentForm::class, 'cancelTurnoView']);
// routes/api.php
Route::get('/enabled-doctors', [DoctorController::class, 'getEnabledDoctors']);
Route::get('/enabled-healthinsurances', [HealthinsurancesController::class, 'getEnabledhealthinsurances']);

Route::post('/admin/sync/save', [AdminConfigurationController::class, 'store']);
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    Route::get('/admin/sync/load', [AdminConfigurationController::class, 'index']);

    return $request->user();
});
