<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_translations', function (Blueprint $table) {
            $table->id();
            $table->string('group');
            $table->string('key');
            $table->json('values')->nullable();
            $table->boolean('is_published')->default(true);
            $table->string('source')->nullable();
            $table->string('source_file')->nullable();
            $table->boolean('is_vendor')->default(false);
            $table->timestamps();

            $table->unique(['group', 'key'], 'fts_trans_key_unique');
            $table->index('is_published');
            $table->index('source');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_translations');
    }
};
