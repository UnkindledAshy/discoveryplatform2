<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->unsignedBigInteger('rawg_id')->unique()->nullable()->after('id');
            $table->decimal('rating', 3, 2)->nullable()->after('platform');
            $table->string('released')->nullable()->after('rating');
            $table->json('developers')->nullable()->after('released');
            $table->json('raw_genres')->nullable()->after('developers');
            $table->json('raw_platforms')->nullable()->after('raw_genres');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->dropColumn(['rawg_id', 'rating', 'released', 'developers', 'raw_genres', 'raw_platforms']);
        });
    }
};
