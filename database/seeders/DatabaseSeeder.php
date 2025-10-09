<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Client;
use App\Models\Product;
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
        Role::create(
            [
                'name' => 'admin',
            ]
        );
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
        User::create(
            [
                'email' => 'admin@test.com',
                'name' => 'Test User',
                'password' => Hash::make('asdasd'),
                'email_verified_at' => now(),
                'role_id' => 1
            ]
        );
        Client::create(
            [
                'email' => 'admin@test.com',
                'name' => 'Test User',
                'cuil' => '123123123',
                'phone' => '1231232',
            ]
        );
    }
}
