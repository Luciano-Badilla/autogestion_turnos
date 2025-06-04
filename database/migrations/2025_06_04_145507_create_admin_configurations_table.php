<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // database/migrations/xxxx_xx_xx_create_admin_configurations_table.php

    public function up()
    {
        Schema::create('admin_configurations', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // 'health_insurance', 'specialty', 'doctor'
            $table->unsignedBigInteger('reference_id'); // ID del item (obra social, especialidad o doctor)
            $table->unsignedBigInteger('parent_id')->nullable(); // en caso de ser doctor, guardar la especialidad relacionada
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_configurations');
    }
};
