<?php

namespace App\Http\Controllers;

use App\Models\HealthInsurance;
use App\Models\Specialty;
use App\Models\Doctor;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class AdminPanel extends Controller
{

    public function index()
    {

        return Inertia::render('AdminPanel');
    }


    public function saveToggles(Request $request)
    {
        foreach ($request->healthInsurances as $item) {
            HealthInsurance::where('external_id', $item['id'])->update(['enabled' => $item['enabled']]);
        }

        foreach ($request->specialties as $item) {
            $specialty = Specialty::where('external_id', $item['id'])->first();
            if ($specialty) {
                $specialty->update(['enabled' => $item['enabled']]);

                foreach ($item['doctors'] as $doc) {
                    Doctor::where('external_id', $doc['id'])->update(['enabled' => $doc['enabled']]);
                }
            }
        }

        return response()->json(['message' => 'Configuración guardada']);
    }
}
