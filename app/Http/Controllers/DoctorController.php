<?php

namespace App\Http\Controllers;

// app/Http/Controllers/DoctorController.php

use App\Models\AdminConfiguration;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DoctorController extends Controller
{
    public function getEnabledDoctors($idHealthInsurance)
    {
        // IDs de doctores habilitados (de type 'doctor')
        $enabledDoctorIds = AdminConfiguration::where('type', 'doctor')
            ->pluck('reference_id')
            ->toArray();

        // Filtrar los doctores que estén habilitados y tengan la obra social especificada
        $doctorIdsWithInsurance = AdminConfiguration::where('type', 'doctor_insurance')
            ->where('reference_id', $idHealthInsurance) // la obra social pasada
            ->whereIn('parent_id', $enabledDoctorIds)   // que además estén habilitados
            ->pluck('parent_id') // IDs de doctores
            ->toArray();

        return $doctorIdsWithInsurance;
    }

    public function getEnabledDoctorsAll()
    {
        $configs = AdminConfiguration::where('type', 'doctor')->get();

        $enabledDoctors = $configs->map(function ($config) {
            return [
                'doctor_id' => (int) $config->reference_id,
                'specialty_id' => (int) $config->parent_id,
            ];
        });

        // Agrupar por specialty_id
        $grouped = $enabledDoctors->groupBy('specialty_id');

        return response()->json([
            'data' => $grouped
        ]);
    }

    // app/Http/Controllers/AdminController.php
    public function getEnabledPlansAll()
    {
        $enabledPlans = AdminConfiguration::where('type', 'plan')
            ->get()
            ->groupBy('parent_id'); // Agrupar por obra social

        $result = [];

        foreach ($enabledPlans as $healthInsuranceId => $plans) {
            $result[$healthInsuranceId] = $plans->map(function ($plan) {
                return [
                    'plan_id' => $plan->reference_id,
                ];
            })->values();
        }

        return response()->json([
            'data' => $result
        ]);
    }
}
