<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    protected $fillable = [
        'external_id',
        'first_name',
        'last_name',
    ];

    public $timestamps = false;

    public function specialties()
    {
        return $this->belongsToMany(Specialty::class);
    }

    // Opcional: nombre completo
    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }
}
