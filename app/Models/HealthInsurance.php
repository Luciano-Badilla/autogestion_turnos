<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HealthInsurance extends Model
{
    protected $fillable = [
        'external_id',
        'name',
    ];

    public $timestamps = false;
}
