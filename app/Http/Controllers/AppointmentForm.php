<?php

namespace App\Http\Controllers;

use App\Mail\TurnoConfirmado;
use App\Models\AdminConfiguration;
use App\Models\CanceledTurnos;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AppointmentForm extends Controller
{

    public function index()
    {
        $specialties = $this->getSpecialties();

        $configs = AdminConfiguration::all()->groupBy('type');

        $enabledSpecialtyIds = $configs->get('specialty')?->pluck('reference_id')->toArray() ?? [];

        $filteredSpecialties = collect($specialties)
            ->filter(fn($item) => in_array($item['id'], $enabledSpecialtyIds))
            ->values();

        // NUEVO: traer mensajes por especialidad (independiente de si está activa)
        $messages = AdminConfiguration::where('type', 'specialty_message')->get()
            ->mapWithKeys(function ($row) {
                return [
                    (int)$row->reference_id => trim((string) data_get($row->payload, 'message', '')),
                ];
            });

        return Inertia::render('AppointmentForm', [
            'specialties'            => $filteredSpecialties,
            'specialtyMessagesById'  => $messages, // ← NUEVO
        ]);
    }






    public function getHealthInsurances()
    {
        $response = Http::timeout(60)->withHeaders([
            'X-API-KEY' => ENV('API_PASS')
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
        $response = Http::timeout(60)->withHeaders([
            env('API_HEADER') => env('API_PASS'),
        ])->get("http://172.22.118.101:81/apiturnos/public/api/v1/profesionales/{$id}");

        if (!$response->successful()) {
            return response()->json(['error' => 'No se pudieron obtener los datos'], 500);
        }

        $doctors = $response->json();

        // Obtener IDs de los doctores recibidos desde la API externa
        $doctorIds = collect($doctors)->pluck('id')->map(fn($id) => (string) $id)->all();

        $localDoctors = Doctor::whereIn('id', $doctorIds)->get()->keyBy('id');

        $doctors = collect($doctors)->map(function ($doctor) use ($localDoctors) {
            $doctorId = (string) $doctor['id'];
            $local = $localDoctors->get($doctorId);
            $doctor['imagen_url'] = $local?->imagen_url ?? null;
            return $doctor;
        });

        return response()->json($doctors);
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

        if ($response->successful()) {
            $json = $response->json();

            // Detectar "paciente no encontrado" del upstream
            $sinResultados =
                (isset($json['data']) && is_array($json['data']) && count($json['data']) === 0)
                || (isset($json['meta']['totalRecords']) && (int)$json['meta']['totalRecords'] === 0);

            if ($sinResultados) {
                // <-- devolvemos 404 para que el front NO habilite registro por error
                return response()->json([
                    'error' => 'Paciente no encontrado',
                    'code'  => 'PATIENT_NOT_FOUND',
                ], 404);
            }

            // Caso normal: devolver tal cual como antes
            return $json;
        } else {
            // Propaga tal cual lo que respondió la API principal (incluye 404)
            return response($response->body(), $response->status())
                ->header('Content-Type', $response->header('Content-Type', 'application/json'));
        }
    }

    public function postTurno(Request $request)
    {
        $resumenHtml = $request->input('resumen_html');
        $email = $request->input('email');
        $data = $request->input('data');
        Log::info($request->all());

        $validated = $request->validate([
            'hora' => 'required|string',
            'fecha' => 'required|date',
            'orden' => 'required|integer',
            'agenda_id' => 'required|integer',
            'persona_id' => 'required|integer',
            'especialidad_id' => 'required|integer',
            'actualizarObraSocial' => 'required|boolean',
            'obraSocialId' => 'nullable',
            'planId' => 'nullable',
        ]);

        $response = Http::withHeaders([
            ENV('API_HEADER') => ENV('API_PASS')
        ])->post('http://172.22.118.101:81/apiturnos/public/api/v1/crear/turno', $validated);
        if ($response->successful()) {
            $json = $response->json();
            $turnoId = $json['turno']['data']['id'];
            $key = base64_decode(env('TURNO_KEY'));
            $iv = base64_decode(env('TURNO_IV'));

            $datosTurno = [
                'id' => $this->encryptTurnoId($turnoId, $key, $iv),
                'nombre' => $data['firstName'],
                'apellido' => $data['lastName'],
                'dni' => $data['documentNumber'],
                'obra_social' => $data['healthInsurance'],
                'email' => $data['email'],
                'telefono' => $data['phone'],
                'especialidad' => $data['specialty'],
                'medico' => $data['doctor'],
                'fecha' => $data['date'],
                'hora' => $data['time'],
            ];

            $payload = json_encode($datosTurno);
            $key = base64_decode(env('TURNO_KEY'));
            $iv = base64_decode(env('TURNO_IV'));
            $token = base64_encode(openssl_encrypt($payload, 'AES-128-CBC', $key, OPENSSL_RAW_DATA, $iv));

            $resumenHtml = str_replace('$turnoId', $this->encryptTurnoId($turnoId, $key, $iv), $resumenHtml);
            $resumenHtml = str_replace('{tokenEncriptado}', urlencode($token), $resumenHtml);
            Mail::to($email)->send(new TurnoConfirmado($resumenHtml));
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



        if ($response->successful()) {
            return response()->json($response->json(), 200);
        } else {
            return response()->json(['error' => 'Error al crear el turno'], $response->status());
        }
    }

    public function cancelTurnoView($id, Request $request)
    {
        $isCanceled = CanceledTurnos::where('encryptedId', $id)->exists();
        $key = base64_decode(env('TURNO_KEY'));
        $iv = base64_decode(env('TURNO_IV'));

        $token = $request->query('token');

        try {
            $json = openssl_decrypt(base64_decode($token), 'AES-128-CBC', $key, OPENSSL_RAW_DATA, $iv);
            $datos = json_decode($json, true);

            if (!$datos) {
                throw new \Exception("Datos corruptos");
            }

            if (!$isCanceled) {
                return Inertia::render('Cancel', ['datos' => $datos]);
            } else {
                return Inertia::render('IsCanceled', ['datos' => $datos]);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Token inválido o corrupto.'], 400);
        }
    }
    public function putCancelTurno($id, Request $request)
    {
        $response = Http::withHeaders([
            ENV('API_HEADER') => ENV('API_PASS')
        ])->put('http://172.22.118.101:81/apiturnos/public/api/v1/cancelarTurnos/' . $id);

        if ($response->successful()) {
            CanceledTurnos::create([
                'encryptedId' => $id
            ]);
            $email = $request->input('email');
            $cancelacionHtml = $request->input('cancelacionHtml');
            Mail::to($email)->send(new TurnoConfirmado($cancelacionHtml));
        }
        return $response;
    }

    public function uploadImage(Request $request, $doctorId)
    {
        $request->validate([
            'imagen' => 'required|image|max:2048', // hasta 2MB
        ]);

        // Buscar o crear el registro del doctor
        $doctor = Doctor::firstOrNew(['id' => $doctorId]);

        // Eliminar imagen anterior si existe
        if ($doctor->imagen_url) {
            Storage::disk('public')->delete($doctor->imagen_url);
        }

        // Subir y guardar nueva imagen
        $path = $request->file('imagen')->store('doctores', 'public');
        $basePath = ENV('VITE_API_BASE_URL') . '/storage/';
        $doctor->imagen_url = $basePath . $path;
        $doctor->save();

        return response()->json([
            'imagen_url' => asset(Storage::url($path)),
        ]);
    }

    private function encryptTurnoId($id, $key, $iv)
    {
        $encrypted = openssl_encrypt($id, 'AES-128-CBC', $key, OPENSSL_RAW_DATA, $iv);
        return $this->base64url_encode($encrypted);
    }

    private function base64url_encode($data)
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
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
