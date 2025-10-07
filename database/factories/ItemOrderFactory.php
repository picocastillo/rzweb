<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\ItemOrder;

class ItemOrderFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = ItemOrder::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'order_id' => fake()->numberBetween(-10000, 10000),
            'stock_movement_id' => fake()->numberBetween(-10000, 10000),
            'created_at' => fake()->dateTime(),
            'product_id' => fake()->numberBetween(-10000, 10000),
            'qty' => fake()->numberBetween(-10000, 10000),
        ];
    }
}
