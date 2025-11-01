<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Client;
use App\Models\Product;
use App\Models\Cost;
use App\Models\Order;
use App\Models\StockMovement;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        //Roles
        Role::create(
            [
                'name' => 'admin',
            ]
        );

        //Products
        Product::create(
            [
                'name' => 'Vallas Cortas',
            ]
        );
         Product::create(
            [
                'name' => 'Vallas Largas',
            ]
        ); Product::create(
            [
                'name' => 'Chapones',
            ]
        ); Product::create(
            [
                'name' => 'Balizas',
            ]
        ); Product::create(
            [
                'name' => 'Carteles',
            ]
        );

        //Costs for products
        Cost::create(
            [
                'product_id' => 1,
                'price' => 100,
            ]
        );
        Cost::create(
            [
                'product_id' => 2,
                'price' => 105,
            ]
        );
        Cost::create(
            [
                'product_id' => 3,
                'price' =>90,
            ]
        );
        Cost::create(
            [
                'product_id' => 4,
                'price' => 120,
            ]
        );
        Cost::create(
            [
                'product_id' => 5,
                'price' => 100,
            ]
        );

        //Stock for products
        StockMovement::create(
            [
                'product_id' => 1,
                'type' => 1,
                'is_billed' => false,
                'qty' => 20,
            ]
        );
        StockMovement::create(
            [
                'product_id' => 2,
                'type' => 1,
                'is_billed' => false,
                'qty' => 30,
            ]
        );
        StockMovement::create(
            [
                'product_id' => 3,
                'type' => 1,
                'is_billed' => false,
                'qty' => 50,
            ]
        );
        StockMovement::create(
            [
                'product_id' => 4,
                'type' => 1,
                'is_billed' => false,
                'qty' => 20,
            ]
        );
        StockMovement::create(
            [
                'product_id' => 5,
                'type' => 1,
                'is_billed' => false,
                'qty' => 50,
            ]
        );

        //Admin user
        User::create(
            [
                'email' => 'admin@test.com',
                'name' => 'Admin',
                'password' => Hash::make('asdasd'),
                'email_verified_at' => now(),
                'role_id' => 1
            ]
        );

        //Test client
        Client::create(
            [
                'email' => 'client@test.com',
                'name' => 'Test User',
                'cuil' => '123123123',
                'phone' => '1231232',
            ]
        );

        //Orders
        Order::create(
            [
                'user_id' => 1,
                'client_id' => 1,
                'last_state' => 0,
                'address' => 'Calle Falsa 123',
                'code' => 'ORD001',
                'date_from' => '2025-10-01',
                'date_to'   => '2025-10-15',
                'is_active' => true,
            ]
        );
        Order::create(
            [
                'user_id' => 1,
                'client_id' => 1,
                'last_state' => 0,
                'address' => 'Calle Falsa 123',
                'code' => 'ORD001',
                'date_from' => '2025-10-01',
                'date_to'   => '2025-10-25',
                'is_active' => true,
            ]
        );
        Order::create(
            [
                'user_id' => 1,
                'client_id' => 1,
                'last_state' => 0,
                'address' => 'Calle Falsa 123',
                'code' => 'ORD001',
                'date_from' => '2025-09-01',
                'date_to'   => '2025-09-25',
                'is_active' => true,
            ]
        );
    }
}
