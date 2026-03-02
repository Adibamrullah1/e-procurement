<?php

namespace Database\Factories;

use App\Models\Procurement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProcurementItem>
 */
class ProcurementItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $quantity = fake()->numberBetween(1, 10);
        $price = fake()->randomFloat(2, 100, 10000);
        return [
            'procurement_id' => Procurement::factory(),
            'item_name' => fake()->words(3, true),
            'quantity' => $quantity,
            'unit_price' => $price,
            'sub_total' => $quantity * $price,
        ];
    }
}
