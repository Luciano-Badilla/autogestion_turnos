<?php

namespace App\Http\Controllers;

use App\Models\AdminConfiguration;
use App\Models\HealthInsurance;
use App\Models\Specialty;
use App\Models\Doctor;
use App\Models\Role;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Request;
use Inertia\Inertia;

class AdminPanel extends Controller
{

    public function index()
    {
        $configs = AdminConfiguration::all()->groupBy('type');

        $normalizedConfig = $configs->map(function ($items, $type) {
            return $items->map(function ($item) use ($type) {
                return match ($type) {
                    'doctor', 'specialty', 'health_insurance' => [
                        'value' => (int) $item->reference_id,
                    ],
                    'doctor_insurance' => [
                        'parent_id' => (int) $item->parent_id,
                        'reference_id' => (int) $item->reference_id,
                    ],
                    'plan' => [
                        'health_insurance_id' => (int) $item->parent_id,
                        'plans' => [
                            ['id' => (int) $item->reference_id]
                        ]
                    ],
                    default => [
                        'value' => $item->reference_id,
                    ],
                };
            });
        });

        return Inertia::render('AdminPanel', [
            'config' => $normalizedConfig,
            'user_role' => Auth::user()->role_id,
            'user_role_name' => Role::find(Auth::user()->role_id)->name,
        ]);
    }
}
