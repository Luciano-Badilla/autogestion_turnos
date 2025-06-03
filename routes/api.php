<?php

use App\Http\Controllers\AdminPanel;
use App\Http\Controllers\AppointmentForm;
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
Route::get('/specialties', [AppointmentForm::class, 'getSpecialties']);
Route::get('/doctors/{id}', [AppointmentForm::class, 'getDoctorsBySpeciality'])->name('getDoctorsBySpeciality');
Route::get('/dateTime/{id?}/{specialtyId?}', [AppointmentForm::class, 'getDateTimeByDoctor'])->name('getDateTimeByDoctor');
Route::get('/personalInfo/{dni}', [AppointmentForm::class, 'getPersonalInfoByDni'])->name('getPersonalInfoByDni');
Route::post('/turno/confirmacion', [AppointmentForm::class, 'postTurno'])->name('postTurno');

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    Route::prefix('admin/sync')->group(function () {
        Route::post('/save', [AdminPanel::class, 'saveToggles']);
    });

    return $request->user();
});
