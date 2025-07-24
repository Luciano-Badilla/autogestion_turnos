<?php

namespace App\Http\Controllers;

use App\Models\AdminConfiguration;
use Illuminate\Http\Request;

class plansController extends Controller
{
    public function getEnabledPlans($idHealthInsurance)
    {
        // Filtrar los doctores que estén habilitados y tengan la obra social especificada
        $enabledPlanIds = AdminConfiguration::where('type', 'plan')
            ->where('parent_id', $idHealthInsurance)   // que además estén habilitados
            ->pluck('reference_id') // IDs de doctores
            ->toArray();

        return $enabledPlanIds;
    }
}
