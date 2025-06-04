<?php

namespace App\Http\Controllers;

use App\Models\AdminConfiguration;
use App\Models\HealthInsurance;
use App\Models\Specialty;
use App\Models\Doctor;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Request;
use Inertia\Inertia;

class AdminPanel extends Controller
{

    public function index()
    {
        $configs = AdminConfiguration::all()->groupBy('type');

        $normalizedConfig = $configs->map(function ($items, $type) {
            return $items->map(function ($item) {
                return [
                    'value' => $item->reference_id,
                ];
            });
        });
        return Inertia::render('AdminPanel', [
            'config' => $normalizedConfig,
        ]);
    }
}
