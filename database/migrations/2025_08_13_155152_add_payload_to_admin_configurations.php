<?php

// database/migrations/2025_08_13_000000_add_payload_to_admin_configurations.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('admin_configurations', function (Blueprint $table) {
            $table->json('payload')->nullable()->after('parent_id');
        });
    }

    public function down(): void
    {
        Schema::table('admin_configurations', function (Blueprint $table) {
            $table->dropColumn('payload');
        });
    }
};
