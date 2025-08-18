<?php

use App\Http\Controllers\AdminConfigurationController;
use App\Http\Controllers\AdminPanel;
use App\Http\Controllers\AppointmentForm;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\HealthinsurancesController;
use App\Http\Controllers\plansController;
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
Route::post('/turno/confirmacion', [AppointmentForm::class, 'postTurno'])->name('postTurno');
Route::post('/person/store', [AppointmentForm::class, 'postPersona'])->name('postPersona');
Route::post('/put/turno/{id}', [AppointmentForm::class, 'putCancelTurno']);
Route::get('/cancelar/turno/{id}', [AppointmentForm::class, 'cancelTurnoView']);

// routes/api.php
// routes/api.php
Route::get('/enabled-plans-all', [DoctorController::class, 'getEnabledPlansAll']);
Route::get('/enabled-doctors-all', [DoctorController::class, 'getEnabledDoctorsAll']);
Route::get('/enabled-doctors/{idHealtInsurance?}', [DoctorController::class, 'getEnabledDoctors']);
Route::get('/enabled-healthinsurances', [HealthinsurancesController::class, 'getEnabledhealthinsurances']);
Route::get('/enabled-plans/{idHealthInsurance?}', [plansController::class, 'getEnabledPlans']);

Route::post('/admin/sync/update', [AdminConfigurationController::class, 'update']);
Route::post('/admin/sync/save', [AdminConfigurationController::class, 'store']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
