<?php

// app/Http/Controllers/AdminConfigurationController.php

namespace App\Http\Controllers;

use App\Models\AdminConfiguration;
use Illuminate\Http\Request;

class AdminConfigurationController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'healthInsurances' => 'array',
            'healthInsurances.*' => 'integer',
            'specialties' => 'array',
            'specialties.*.id' => 'integer',
            'specialties.*.doctors' => 'array',
            'specialties.*.doctors.*.id' => 'integer',
            'specialties.*.doctors.*.acceptedInsurances' => 'array',
            'specialties.*.doctors.*.acceptedInsurances.*' => 'integer',
        ]);

        // Borrar configuraciones previas
        AdminConfiguration::truncate();

        // Guardar obras sociales generales
        foreach ($data['healthInsurances'] as $id) {
            AdminConfiguration::create([
                'type' => 'health_insurance',
                'reference_id' => $id,
            ]);
        }

        // Guardar especialidades, médicos y obras sociales aceptadas por cada médico
        foreach ($data['specialties'] as $specialty) {
            AdminConfiguration::create([
                'type' => 'specialty',
                'reference_id' => $specialty['id'],
            ]);

            foreach ($specialty['doctors'] as $doctor) {
                AdminConfiguration::create([
                    'type' => 'doctor',
                    'reference_id' => $doctor['id'],
                    'parent_id' => $specialty['id'],
                ]);

                foreach ($doctor['acceptedInsurances'] as $insuranceId) {
                    AdminConfiguration::create([
                        'type' => 'doctor_insurance',
                        'reference_id' => $insuranceId,
                        'parent_id' => $doctor['id'],
                    ]);
                }
            }
        }

        return response()->json(['message' => 'Configuración guardada.']);
    }


    public function index()
    {
        $config = AdminConfiguration::all()->groupBy('type');
        return response()->json($config);
    }
}
