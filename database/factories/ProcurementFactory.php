<?php

namespace Database\Factories;

use App\Enums\ProcurementStatus;
use App\Models\Category;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Procurement>
 */
class ProcurementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => 'REQ-' . strtoupper(Str::random(10)),
            'user_id' => User::factory(),
            'category_id' => Category::factory(),
            'vendor_id' => null,
            'title' => fake()->sentence(4),
            'total_amount' => fake()->randomFloat(2, 1000, 100000),
            'status' => ProcurementStatus::DRAFT,
            'finance_notes' => null,
        ];
    }
}
