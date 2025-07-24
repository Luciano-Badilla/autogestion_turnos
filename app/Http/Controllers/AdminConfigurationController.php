<?php

// app/Http/Controllers/AdminConfigurationController.php

namespace App\Http\Controllers;

use App\Models\AdminConfiguration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminConfigurationController extends Controller
{
    public function store(Request $request)
    {
        Log::info($request->all());
        $data = $request->validate([
            'healthInsurances' => 'array',
            'healthInsurances.*' => 'integer',
            'specialties' => 'array',
            'specialties.*.id' => 'integer',
            'specialties.*.doctors' => 'array',
            'specialties.*.doctors.*.id' => 'integer',
            'specialties.*.doctors.*.acceptedInsurances' => 'array',
            'specialties.*.doctors.*.acceptedInsurances.*' => 'integer',

            // Cambié aquí:
            'healthInsurancePlans' => 'array',
            'healthInsurancePlans.*.health_insurance_id' => 'integer',
            'healthInsurancePlans.*.plans' => 'array',
            'healthInsurancePlans.*.plans.*.id' => 'integer',
        ]);

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

        // Guardar planes habilitados por obra social
        foreach ($data['healthInsurancePlans'] as $item) {
            $healthInsuranceId = $item['health_insurance_id'];
            foreach ($item['plans'] as $plan) {
                AdminConfiguration::create([
                    'type' => 'plan',
                    'reference_id' => $plan['id'],
                    'parent_id' => $healthInsuranceId,
                ]);
            }
        }


        return response()->json(['message' => 'Configuración guardada.']);
    }



    public function index()
    {
        $rawConfig = AdminConfiguration::all();

        $config = $rawConfig->groupBy('type')->map(function ($items, $type) {
            return $items->map(function ($item) use ($type) {
                return match ($type) {
                    'doctor', 'specialty', 'health_insurance' => [
                        'value' => (int) $item->value,
                    ],
                    'doctor_insurance' => [
                        'parent_id' => (int) $item->parent_id,
                        'reference_id' => (int) $item->value,
                    ],
                    default => [
                        'value' => $item->value,
                    ],
                };
            });
        });

        return response()->json($config);
    }
}
