<?php

namespace App\Http\Controllers;

use App\Models\AdminConfiguration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AppointmentForm extends Controller
{

    public function index()
    {
        // Llamadas a la API externa
        //$healthInsurances = $this->getHealthInsurances(); // array o colección
        $specialties = $this->getSpecialties();           // array o colección

        // Configuración habilitada desde la DB
        $configs = AdminConfiguration::all()->groupBy('type');

        $enabledHealthInsuranceIds = $configs->get('health_insurance')?->pluck('reference_id')->toArray() ?? [];
        $enabledSpecialtyIds = $configs->get('specialty')?->pluck('reference_id')->toArray() ?? [];

        // Filtrar los datos obtenidos desde la API
        /*$filteredHealthInsurances = collect($healthInsurances)->filter(function ($item) use ($enabledHealthInsuranceIds) {
            return in_array($item['id'], $enabledHealthInsuranceIds);
        })->values();*/

        $filteredSpecialties = collect($specialties)->filter(function ($item) use ($enabledSpecialtyIds) {
            return in_array($item['id'], $enabledSpecialtyIds);
        })->values();


        return Inertia::render('AppointmentForm', [
            'specialties' => $filteredSpecialties,
        ]);
    }





    public function getHealthInsurances()
    {
        $response = Http::timeout(60)->withHeaders([
            ENV('API_HEADER') => ENV('API_PASS')
        ])->get('http://172.22.118.101:81/apiturnos/public/api/v1/obrasocial');

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

    public function getPlanes($id)
    {
        $response = Http::timeout(60)->withHeaders([
            ENV('API_HEADER') => ENV('API_PASS')
        ])->get('http://172.22.118.101:81/apiturnos/public/api/v1/planes/' . $id);

        if ($response->successful()) {
            $json = $response->json();


            if (isset($json['planes'])) {
                $planes = json_decode($json['planes'], true);
            } else {
                $planes = $json;
            }

            // Ordenar alfabéticamente por nombre
            usort($planes, function ($a, $b) {
                return strcmp($a['nombre'], $b['nombre']);
            });

            return $planes;
        }

        return [];
    }



    public function getSpecialties()
    {
        $response = Http::timeout(60)->withHeaders([
            ENV('API_HEADER') => ENV('API_PASS')
        ])->get('http://172.22.118.101:81/apiturnos/public/api/v1/especialidades');

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
        $response = Http::timeout(60)->withHeaders([
            ENV('API_HEADER') => ENV('API_PASS')
        ])->get('http://172.22.118.101:81/apiturnos/public/api/v1/profesionales/' . $id);

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
        $response = Http::timeout(60)->withHeaders([
            ENV('API_HEADER') => ENV('API_PASS')
        ])->get('http://172.22.118.101:81/apiturnos/public/api/v1/turnos/' . $id . '/' . $specialtyId);

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
        $response = Http::timeout(60)->withHeaders([
            ENV('API_HEADER') => ENV('API_PASS')
        ])->get('http://172.22.118.101:81/apiturnos/public/api/v1/personas/' . $dni);

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

        $validated = $request->validate([
            'hora' => 'required|string',
            'fecha' => 'required|date',
            'orden' => 'required|integer',
            'agenda_id' => 'required|integer',
            'persona_id' => 'required|integer',
            'especialidad_id' => 'required|integer',
        ]);


        $response = Http::withHeaders([
            ENV('API_HEADER') => ENV('API_PASS')
        ])->post('http://172.22.118.101:81/apiturnos/public/api/v1/crear/turno', $validated);

        if ($response->successful()) {
            return response()->json($response->json(), 200);
        } else {
            return response()->json(['error' => 'Error al crear el turno'], $response->status());
        }
    }

    public function postPersona(Request $request)
    {

        $validated = $request->all();

        $response = Http::withHeaders([
            ENV('API_HEADER') => ENV('API_PASS')
        ])->post('http://172.22.118.101:81/apiturnos/public/api/v1/crear/persona', $validated);

        Log::info($response);


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
            $response = Http::timeout(3)->get('http://172.22.118.101:81/apiturnos/public/api/v1/profesionales/' . $id);

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
            $response = Http::timeout(3)->get('http://172.22.118.101:81/apiturnos/public/api/v1/turnos/' . $id);

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
