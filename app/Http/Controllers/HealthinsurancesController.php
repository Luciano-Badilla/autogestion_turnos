<?php

namespace App\Http\Controllers;

use App\Models\AdminConfiguration;
use Illuminate\Http\Request;

class HealthinsurancesController extends Controller
{
    public function getEnabledhealthinsurances()
    {
        $enabledHealthInsuranceIds = AdminConfiguration::where('type', 'health_insurance')
            ->pluck('reference_id')
            ->toArray();

        return $enabledHealthInsuranceIds;
    }
}
