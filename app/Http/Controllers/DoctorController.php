<?php

namespace App\Http\Controllers;

// app/Http/Controllers/DoctorController.php

use App\Models\AdminConfiguration;
use Illuminate\Support\Facades\Http;

class DoctorController extends Controller
{
    public function getEnabledDoctors()
    {
        $enabledDoctorIds = AdminConfiguration::where('type', 'doctor')
            ->pluck('reference_id')
            ->toArray();

        return $enabledDoctorIds;
    }
}
