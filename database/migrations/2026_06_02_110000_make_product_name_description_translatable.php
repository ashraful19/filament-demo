<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $fallback = config('filament-translation-suite.fallback_locale', 'en');

        $products = DB::table('products')->select('id', 'name', 'description')->get();

        foreach ($products as $product) {
            DB::table('products')->where('id', $product->id)->update([
                'name' => json_encode([$fallback => $product->name]),
            ]);

            if ($product->description !== null) {
                DB::table('products')->where('id', $product->id)->update([
                    'description' => json_encode([$fallback => $product->description]),
                ]);
            }
        }

        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('ALTER TABLE products MODIFY name JSON NOT NULL');
            DB::statement('ALTER TABLE products MODIFY description JSON NULL');
        }
    }

    public function down(): void
    {
        $fallback = config('filament-translation-suite.fallback_locale', 'en');

        $products = DB::table('products')->select('id', 'name', 'description')->get();

        foreach ($products as $product) {
            $name = json_decode($product->name, true);
            $data = [
                'name' => is_array($name)
                    ? ($name[$fallback] ?? reset($name) ?? '')
                    : (string) $product->name,
            ];

            if ($product->description !== null) {
                $desc = json_decode($product->description, true);
                $data['description'] = is_array($desc)
                    ? ($desc[$fallback] ?? reset($desc))
                    : (string) $product->description;
            }

            DB::table('products')->where('id', $product->id)->update($data);
        }

        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('ALTER TABLE products MODIFY name VARCHAR(255) NOT NULL');
            DB::statement('ALTER TABLE products MODIFY description LONGTEXT NULL');
        }
    }
};
