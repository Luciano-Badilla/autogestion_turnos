<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AppointmentForm extends Controller
{
    public function index()
    {
        $healthInsurances = $this->getHealthInsurances();
        $specialties = $this->getSpecialties();

        return Inertia::render('AppointmentForm', [
            'healthInsurances' => $healthInsurances,
            'specialties' => $specialties,
        ]);
    }



    public function getHealthInsurances()
    {
        $response = Http::timeout(60)->get('http://172.22.116.35/prueba-api/public/api/v1/obrasocial');

        if ($response->successful()) {
            $json = $response->json();

            if (isset($json['healthInsurances'])) {
                $insurances = json_decode($json['healthInsurances'], true);
            } else {
                $insurances = $json;
            }

            // Ordenar alfabéticamente por nombre
            usort($insurances, function ($a, $b) {
                return strcmp($a['nombre'], $b['nombre']);
            });

            return $insurances;
        }

        return [];
    }



    public function getSpecialties()
{
    $response = Http::timeout(60)->get('http://172.22.116.35/prueba-api/public/api/v1/especialidades');

    if ($response->successful()) {
        $specialties = $response->json();

        // Ordenar alfabéticamente por nombre
        usort($specialties, function ($a, $b) {
            return strcmp($a['nombre'], $b['nombre']);
        });

        return array_values($specialties);
    }

    return [];
}



    public function getDoctorsBySpeciality($id)
    {
        // Hacer una solicitud a la API externa
        $response = Http::timeout(60)->get('http://172.22.116.35/prueba-api/public/api/v1/profesionales/' . $id);

        // Verificar si la respuesta es correcta
        if ($response->successful()) {
            $doctors = $response->json(); // Obtener el cuerpo de la respuesta como array
            return $doctors;
        } else {
            return response()->json(['error' => 'No se pudieron obtener los datos'], 500);
        }
    }

    public function getDateTimeByDoctor($id, $specialtyId)
    {
        $response = Http::timeout(60)->get('http://172.22.116.35/prueba-api/public/api/v1/turnos/' . $id . '/' . $specialtyId);

        // Verificar si la respuesta es correcta
        if ($response->successful()) {
            $dateTimes = $response->json(); // Obtener el cuerpo de la respuesta como array
            return $dateTimes;
        } else {
            return response()->json(['error' => 'No se pudieron obtener los datos'], 500);
        }
    }

    public function getPersonalInfoByDni($dni)
    {
        $response = Http::timeout(60)->get('http://172.22.116.35/prueba-api/public/api/v1/personas/' . $dni);

        // Verificar si la respuesta es correcta
        if ($response->successful()) {
            $personalInfo = $response->json(); // Obtener el cuerpo de la respuesta como array
            return $personalInfo;
        } else {
            return response()->json(['error' => 'No se pudieron obtener los datos'], 500);
        }
    }

    public function postTurno(Request $request)
    {

        Log::info($request);
        $validated = $request->validate([
            'hora' => 'required|string',
            'fecha' => 'required|date',
            'orden' => 'required|integer',
            'agenda_id' => 'required|integer',
            'persona_id' => 'required|integer',
            'especialidad_id' => 'required|integer',
        ]);


        $response = Http::post('http://172.22.116.35/prueba-api/public/api/v1/crear/turno', $validated);

        if ($response->successful()) {
            return response()->json($response->json(), 200);
        } else {
            return response()->json(['error' => 'Error al crear el turno'], $response->status());
        }
    }

    /*

    public function gethealthInsurances()
    {
        // Simulación de respuesta ficticia
        $healthInsurances = [
            ['id' => 1, 'nombre' => 'OSDE'],
            ['id' => 2, 'nombre' => 'Swiss Medical'],
            ['id' => 3, 'nombre' => 'PAMI'],
            ['id' => 4, 'nombre' => 'IOMA'],
        ];

        return $healthInsurances;
    }

    public function getSpecialties()
    {
        // Simulación de respuesta ficticia
        $specialties = [
            ['id' => 1, 'nombre' => 'Cardiología'],
            ['id' => 2, 'nombre' => 'Dermatología'],
            ['id' => 3, 'nombre' => 'Pediatría'],
            ['id' => 4, 'nombre' => 'Neurología'],
        ];

        return $specialties;
    }


    public function getDoctorsBySpeciality($id)
    {
        try {
            $response = Http::timeout(3)->get('http://172.22.116.35/prueba-api/public/api/v1/profesionales/' . $id);

            if ($response->successful()) {
                return $response->json();
            }
        } catch (\Exception $e) {
            // Podrías loguear el error si lo deseas: Log::error($e);
        }

        // Datos ficticios si falla la API
        return [
            ['id' => 1, 'nombres' => 'Dr. Juan Pérez'],
            ['id' => 2, 'nombres' => 'Dra. María López'],
        ];
    }

    public function getDateTimeByDoctor($id)
    {
        try {
            $response = Http::timeout(3)->get('http://172.22.116.35/prueba-api/public/api/v1/turnos/' . $id);

            if ($response->successful()) {
                return $response->json();
            }
        } catch (\Exception $e) {
            // Log::error($e);
        }

        // Datos ficticios si falla la API
        return [
            ['fecha' => '2025-05-15', 'hora' => '09:00'],
            ['fecha' => '2025-05-15', 'hora' => '10:30'],
            ['fecha' => '2025-05-16', 'hora' => '11:00'],
        ];
    */
}
