<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class comercializacion_configurations extends Model
{
    protected $fillable = ['type', 'reference_id', 'parent_id'];
}
