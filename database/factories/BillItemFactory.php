<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\BillItem;

class BillItemFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = BillItem::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'created_at' => fake()->dateTime(),
            'bill_id' => fake()->numberBetween(-10000, 10000),
            'days' => fake()->numberBetween(-10000, 10000),
            'stock_movement_id' => fake()->numberBetween(-10000, 10000),
        ];
    }
}
