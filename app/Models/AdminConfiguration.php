<?php

// app/Models/AdminConfiguration.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminConfiguration extends Model
{
    protected $fillable = ['type', 'reference_id', 'parent_id', 'payload'];

    protected $casts = ['payload' => 'array'];
}
