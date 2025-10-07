<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\Bill;

class BillFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Bill::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'client_id' => fake()->numberBetween(-10000, 10000),
            'date_from' => fake()->dateTime(),
            'date_to' => fake()->dateTime(),
            'amount' => fake()->randomFloat(0, 0, 9999999999.),
            'name' => fake()->name(),
            'cuil' => fake()->word(),
            'phone' => fake()->phoneNumber(),
            'created_at' => fake()->dateTime(),
        ];
    }
}
