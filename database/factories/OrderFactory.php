<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\Order;

class OrderFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Order::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'user_id' => fake()->numberBetween(-10000, 10000),
            'last_state' => fake()->word(),
            'created_at' => fake()->dateTime(),
            'address' => fake()->word(),
            'code' => fake()->word(),
            'is_active' => fake()->boolean(),
        ];
    }
}
