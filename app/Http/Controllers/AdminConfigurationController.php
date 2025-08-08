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
            'user_role' => 'integer',
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


    public function update(Request $request)
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

            'healthInsurancePlans' => 'array',
            'healthInsurancePlans.*.health_insurance_id' => 'integer',
            'healthInsurancePlans.*.plans' => 'array',
            'healthInsurancePlans.*.plans.*.id' => 'integer',

            'user_role' => 'required|integer',
        ]);

        $user_role = $data['user_role'];

        if (in_array($user_role, [1, 3])) {
            // Guardar obras sociales generales
            if (!empty($data['healthInsurances'])) {
                foreach ($data['healthInsurances'] as $id) {
                    comercializacion_configurations::updateOrCreate(
                        [
                            'type' => 'health_insurance',
                            'reference_id' => $id,
                        ],
                        []
                    );
                }
            }

            // Guardar planes de obras sociales
            if (!empty($data['healthInsurancePlans'])) {
                foreach ($data['healthInsurancePlans'] as $item) {
                    $healthInsuranceId = $item['health_insurance_id'];

                    foreach ($item['plans'] as $plan) {
                        comercializacion_configurations::updateOrCreate(
                            [
                                'type' => 'plan',
                                'reference_id' => $plan['id'],
                                'parent_id' => $healthInsuranceId,
                            ],
                            []
                        );
                    }
                }
            }
        }

        if (in_array($user_role, [1, 4])) {
            // Guardar especialidades, médicos y obras sociales aceptadas
            if (!empty($data['specialties'])) {
                foreach ($data['specialties'] as $specialty) {
                    // Asegurar que la especialidad exista
                    call_center_configurations::updateOrCreate(
                        [
                            'type' => 'specialty',
                            'reference_id' => $specialty['id'],
                        ],
                        []
                    );

                    foreach ($specialty['doctors'] as $doctor) {
                        // Asegurar que el médico exista bajo esa especialidad
                        call_center_configurations::updateOrCreate(
                            [
                                'type' => 'doctor',
                                'reference_id' => $doctor['id'],
                                'parent_id' => $specialty['id'],
                            ],
                            []
                        );

                        // Eliminar las obras sociales anteriores para ese médico
                        call_center_configurations::where('type', 'doctor_insurance')
                            ->where('parent_id', $doctor['id'])
                            ->delete();

                        // Agregar las nuevas
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
        }

        // Sincronizar con AdminConfiguration (solo los cambios nuevos)
        // Primero eliminamos los registros actuales de esos tipos que estamos actualizando

        if (in_array($user_role, [1, 3])) {
            AdminConfiguration::whereIn('type', ['health_insurance', 'plan'])->delete();

            comercializacion_configurations::all()->each(function ($config) {
                AdminConfiguration::updateOrCreate([
                    'type' => $config->type,
                    'reference_id' => $config->reference_id,
                    'parent_id' => $config->parent_id,
                ]);
            });
        }

        if (in_array($user_role, [1, 4])) {
            AdminConfiguration::whereIn('type', ['specialty', 'doctor', 'doctor_insurance'])->delete();

            call_center_configurations::all()->each(function ($config) {
                AdminConfiguration::updateOrCreate([
                    'type' => $config->type,
                    'reference_id' => $config->reference_id,
                    'parent_id' => $config->parent_id,
                ]);
            });
        }

        return response()->json(['message' => 'Configuración actualizada correctamente.']);
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
