<?php

namespace Database\Seeders;

use App\Models\Cost;
use App\Models\Role;
use App\Models\User;
use App\Models\Order;
use App\Models\Client;
use App\Models\Product;
use App\Models\StockMovement;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Database\Seeders\OrderBillingSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call([
            OrderBillingSeeder::class
        ]);

        //Roles
        // Role::create(
        //     [
        //         'name' => 'admin',
        //     ]
        // );

        //Admin user
        // User::create(
        //     [
        //         'email' => 'admin@test.com',
        //         'name' => 'Admin',
        //         'password' => Hash::make('asdasd'),
        //         'email_verified_at' => now(),
        //         'role_id' => 1
        //     ]
        // );

        //Test client
        // Client::create(
        //     [
        //         'email' => 'client@test.com',
        //         'name' => 'Test User',
        //         'cuil' => '123123123',
        //         'phone' => '1231232',
        //     ]
        // );

    }
}
