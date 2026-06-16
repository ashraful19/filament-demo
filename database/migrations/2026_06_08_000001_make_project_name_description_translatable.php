<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $fallback = config('filament-translation-suite.fallback_locale', 'en');

        $projects = DB::table('projects')->select('id', 'name', 'description')->get();

        foreach ($projects as $project) {
            DB::table('projects')->where('id', $project->id)->update([
                'name' => json_encode([$fallback => $project->name]),
            ]);

            if ($project->description !== null) {
                DB::table('projects')->where('id', $project->id)->update([
                    'description' => json_encode([$fallback => $project->description]),
                ]);
            }
        }

        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('ALTER TABLE projects MODIFY name JSON NOT NULL');
            DB::statement('ALTER TABLE projects MODIFY description JSON NULL');
        }
    }

    public function down(): void
    {
        $fallback = config('filament-translation-suite.fallback_locale', 'en');

        $projects = DB::table('projects')->select('id', 'name', 'description')->get();

        foreach ($projects as $project) {
            $name = json_decode($project->name, true);
            $data = [
                'name' => is_array($name)
                    ? ($name[$fallback] ?? reset($name) ?? '')
                    : (string) $project->name,
            ];

            if ($project->description !== null) {
                $desc = json_decode($project->description, true);
                $data['description'] = is_array($desc)
                    ? ($desc[$fallback] ?? reset($desc))
                    : (string) $project->description;
            }

            DB::table('projects')->where('id', $project->id)->update($data);
        }

        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('ALTER TABLE projects MODIFY name VARCHAR(255) NOT NULL');
            DB::statement('ALTER TABLE projects MODIFY description LONGTEXT NULL');
        }
    }
};
