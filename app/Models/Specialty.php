<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Specialty extends Model
{
    protected $fillable = [
        'external_id',
        'name',
    ];

    public $timestamps = false;

    public function doctors()
    {
        return $this->belongsToMany(Doctor::class);
    }
}

