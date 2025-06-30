<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CanceledTurnos extends Model
{   
    protected $table = 'canceledTurnos'; 
    protected $fillable = ['encryptedId'];
}
