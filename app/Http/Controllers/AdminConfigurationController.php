<?php

// app/Http/Controllers/AdminConfigurationController.php

namespace App\Http\Controllers;

use App\Models\AdminConfiguration;
use App\Models\call_center_configurations;
use App\Models\comercializacion_configurations;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

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

            // Cambié aquí:
            'healthInsurancePlans' => 'array',
            'healthInsurancePlans.*.health_insurance_id' => 'integer',
            'healthInsurancePlans.*.plans' => 'array',
            'healthInsurancePlans.*.plans.*.id' => 'integer',
            'user_role'=> 'integer',
        ]);

        $user_role = $data['user_role'];

        //AdminConfiguration::truncate();
        if (in_array($user_role, [1, 3])) {

            comercializacion_configurations::truncate();

            // Guardar obras sociales generales
            foreach ($data['healthInsurances'] as $id) {
                comercializacion_configurations::create([
                    'type' => 'health_insurance',
                    'reference_id' => $id,
                ]);
            }

            foreach ($data['healthInsurancePlans'] as $item) {
                $healthInsuranceId = $item['health_insurance_id'];
                foreach ($item['plans'] as $plan) {
                    comercializacion_configurations::create([
                        'type' => 'plan',
                        'reference_id' => $plan['id'],
                        'parent_id' => $healthInsuranceId,
                    ]);
                }
            }
        }

        if (in_array($user_role, [1, 4])) {

            call_center_configurations::truncate();

            // Guardar especialidades, médicos y obras sociales aceptadas por cada médico
            foreach ($data['specialties'] as $specialty) {
                call_center_configurations::create([
                    'type' => 'specialty',
                    'reference_id' => $specialty['id'],
                ]);

                foreach ($specialty['doctors'] as $doctor) {
                    call_center_configurations::create([
                        'type' => 'doctor',
                        'reference_id' => $doctor['id'],
                        'parent_id' => $specialty['id'],
                    ]);

                    foreach ($doctor['acceptedInsurances'] as $insuranceId) {
                        call_center_configurations::create([
                            'type' => 'doctor_insurance',
                            'reference_id' => $insuranceId,
                            'parent_id' => $doctor['id'],
                        ]);
                    }
                }
            }
        }

        AdminConfiguration::truncate();

        // Migrar configuraciones de Call Center
        call_center_configurations::all()->each(function ($config) {
            AdminConfiguration::create([
                'type' => $config->type,
                'reference_id' => $config->reference_id,
                'parent_id' => $config->parent_id,
            ]);
        });

        // Migrar configuraciones de Comercialización
        comercializacion_configurations::all()->each(function ($config) {
            AdminConfiguration::create([
                'type' => $config->type,
                'reference_id' => $config->reference_id,
                'parent_id' => $config->parent_id,
            ]);
        });


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
