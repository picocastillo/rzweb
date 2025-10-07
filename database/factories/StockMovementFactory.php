<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\StockMovement;

class StockMovementFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = StockMovement::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'product_id' => fake()->numberBetween(-10000, 10000),
            'type' => fake()->word(),
            'description' => fake()->text(),
            'is_billable' => fake()->boolean(),
            'created_at' => fake()->dateTime(),
            'qty' => fake()->numberBetween(-10000, 10000),
        ];
    }
}
