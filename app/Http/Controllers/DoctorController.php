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
}
