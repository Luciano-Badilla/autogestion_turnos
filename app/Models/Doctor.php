<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    public $incrementing = false; // Porque el ID lo definís vos
    protected $fillable = ['id', 'imagen_url'];
}
