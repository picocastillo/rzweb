<?php

namespace Database\Seeders;

use Carbon\Carbon;
use App\Models\Bill;
use App\Models\Cost;
use App\Models\Role;
use App\Models\User;
use App\Models\Order;
use App\Models\Client;
use App\Models\Product;
use App\Models\BillItem;
use App\Models\ItemOrder;
use App\Models\OrderState;
use App\Models\StockMovement;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class OrderBillingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        //Roles
        Role::create(
             [
                'id' => 1,
                'name' => 'admin',
             ]
        );
        Role::create(
             [
                'id' => 2,
                'name' => 'worker',
             ]
        );
        // 1. Crear usuario admin si no existe
        $admin = User::firstOrCreate(
            ['email' => 'admin@test.com'],
            [
                'name' => 'Admin',
                'role_id' => 1,
                'password' => Hash::make('asdasd'),
                'email_verified_at' => now(),
            ]
        );

        // 2. Crear cliente de prueba
        $client = Client::firstOrCreate(
            ['email' => 'cliente@test.com'],
            [
                'name' => 'Cliente Test',
                'cuil' => '20-12345678-9',
                'phone' => '+54 9 11 1234-5678',
            ]
        );

        // 3. Crear productos
        $products = [
            ['name' => 'Vallas Cortas', 'price' => 12000],
            ['name' => 'Vallas Largas', 'price' => 8500],
            ['name' => 'Chapones', 'price' => 6000],
            ['name' => 'Balizas', 'price' => 6500],
            ['name' => 'Carteles', 'price' => 10000],
        ];

        foreach ($products as $prod) {
            $product = Product::firstOrCreate(
                ['name' => $prod['name']],
                ['created_at' => now()]
            );

            // Crear costo del producto
            Cost::firstOrCreate(
                ['product_id' => $product->id],
                ['price' => $prod['price']]
            );

            StockMovement::create([
            'product_id' => $product->id,
            'type' => 1, // 1 = Stock disponible para alquiler
            'qty' => 40,
            'is_billed' => false,
            'created_at' => Carbon::now()->subDays(40)
        ]);
        }

        // 4. ESCENARIO 1: Orden con devolución parcial (para facturar)
        $this->createScenario1($admin, $client);

        // 5. ESCENARIO 2: Orden completamente devuelta
        $this->createScenario2($admin, $client);

        // 6. ESCENARIO 3: Orden sin devoluciones (no se factura nada)
        $this->createScenario3($admin, $client);

        $this->command->info('Seeders de órdenes y facturación creados exitosamente!');
    }

    /**
     * ESCENARIO 1: Orden con devolución parcial
     * - 10 vallas salieron
     * - 10 vallas volvieron (Type 0)
     * - Se debe facturar: 10 vallas
     */
    private function createScenario1($admin, $client)
    {
        $product = Product::where('name', 'Vallas Cortas')->first();
        
        // Crear orden hace 15 días c
        $order = Order::create([
            'user_id' => $admin->id,
            'client_id' => $client->id,
            'code' => 'ORD-001',
            'address' => 'Av. Corrientes 1234, CABA',
            'last_state' => 0,
            'is_active' => true,
            'date_from' => Carbon::now()->subDays(16),
            'date_to' => Carbon::now()->addDays(5),
            'created_at' => Carbon::now()->subDays(15)
        ]);

        OrderState::create([
            'order_id' => $order->id,
            'name' => 0,
        ]);

        // Movimiento de SALIDA inicial (10 vallas salen del depósito)
        $stockMovementOut = StockMovement::create([
            'product_id' => $product->id,
            'type' => 2, // 2 = Salida del depósito (entrada a la orden)
            'qty' => 10,
            'is_billed' => false,
            'created_at' => Carbon::now()->subDays(15)
        ]);

        // Item de la orden
        ItemOrder::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'stock_movement_id' => $stockMovementOut->id,
            'qty' => 10,
            'created_at' => Carbon::now()->subDays(15)
        ]);

        // Movimiento de DEVOLUCIÓN hace 5 días (10 vallas vuelven al depósito)
        $stockMovementReturn = StockMovement::create([
            'product_id' => $product->id,
            'type' => 0, // 0 = Devolución (vuelven al depósito) - SE DEBE FACTURAR
            'qty' => 10,
            'is_billed' => true,
            'created_at' => Carbon::now()->subDays(5)
        ]);

        // Vincular devolución a la orden
        ItemOrder::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'stock_movement_id' => $stockMovementReturn->id,
            'qty' => 10,
            'created_at' => Carbon::now()->subDays(5)
        ]);

        $cost = Cost::where('product_id', $product->id)->latest()->first();
        // calcular días entre salida y devolución
        $days = Carbon::now()->subDays(15)->diffInDays(Carbon::now()->subDays(5));
        $amount = $cost->price * $days * $stockMovementReturn->qty;

        // crear bill por los 5 devueltos
        $bill = Bill::create([
            'client_id' => $client->id,
            'date_from' => $order->date_from,
            'amount' => $amount,
            'created_at' => $stockMovementReturn->created_at,
        ]);

        BillItem::create([
            'bill_id' => $bill->id,
            'stock_movement_id' => $stockMovementReturn->id,
            'days' => $days,
        ]);

        $this->command->info("Escenario 1 creado: Orden {$order->code} - 10 vallas salieron, 10 devueltas (facturables)");
    }

    /**
     * ESCENARIO 2: Orden con devolución total
     * - 20 conos salieron
     * - 20 conos volvieron
     * - Se debe facturar: 20 conos
     */
    private function createScenario2($admin, $client)
    {
        $product = Product::where('name', 'Vallas Largas')->first();
        
        $order = Order::create([
            'user_id' => $admin->id,
            'client_id' => $client->id,
            'code' => 'ORD-002',
            'address' => 'Av. Rivadavia 5678, CABA',
            'last_state' => 0,
            'is_active' => false,
            'date_from' => Carbon::now()->subDays(30),
            'date_to' => Carbon::now()->subDays(10),
            'created_at' => Carbon::now()->subDays(30)
        ]);

        OrderState::create([
            'order_id' => $order->id,
            'name' => 0,
        ]);


        // Salida inicial
        $stockMovementOut = StockMovement::create([
            'product_id' => $product->id,
            'type' => 2,
            'qty' => 20,
            'is_billed' => false,
            'created_at' => Carbon::now()->subDays(30)
        ]);

        ItemOrder::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'stock_movement_id' => $stockMovementOut->id,
            'qty' => 20,
            'created_at' => Carbon::now()->subDays(30)
        ]);

        // Devolución total
        $stockMovementReturn = StockMovement::create([
            'product_id' => $product->id,
            'type' => 0,
            'qty' => 20,
            'is_billed' => true,
            'created_at' => Carbon::now()->subDays(10)
        ]);

        ItemOrder::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'stock_movement_id' => $stockMovementReturn->id,
            'qty' => 20,
            'created_at' => Carbon::now()->subDays(10)
        ]);

        $cost = Cost::where('product_id', $product->id)->latest()->first();
        // calcular días entre salida y devolución
        $days = Carbon::now()->subDays(30)->diffInDays(Carbon::now()->subDays(10));
        $amount = $cost->price * $days * $stockMovementReturn->qty;

        // crear bill total
        $bill = Bill::create([
            'client_id' => $client->id,
            'date_from' => $order->date_from,
            'amount' => $amount,
            'created_at' => $stockMovementReturn->created_at,
        ]);

        BillItem::create([
            'bill_id' => $bill->id,
            'stock_movement_id' => $stockMovementReturn->id,
            'days' => $days,
        ]);

        $this->command->info("Escenario 2 creado: Orden {$order->code} - 20 conos salieron y volvieron todos");
    }

    /**
     * ESCENARIO 3: Orden sin devoluciones
     * - 15 cintas salieron
     * - 0 devueltas
     * - Si facturamos, se debe facturar 15 cintas y devolverlas para que sigan en la orden
     */
    private function createScenario3($admin, $client)
    {
        $product = Product::where('name', 'Chapones')->first();
        
        $order = Order::create([
            'user_id' => $admin->id,
            'client_id' => $client->id,
            'code' => 'ORD-003',
            'address' => 'Av. Santa Fe 9012, CABA',
            'last_state' => 0,
            'is_active' => true,
            'date_from' => Carbon::now()->subDays(7),
            'date_to' => Carbon::now()->addDays(23),
            'created_at' => Carbon::now()->subDays(7)
        ]);

        OrderState::create([
            'order_id' => $order->id,
            'name' => 0,
        ]);

        // Solo salida, sin devoluciones
        $stockMovementOut = StockMovement::create([
            'product_id' => $product->id,
            'type' => 2,
            'qty' => 15,
            'is_billed' => false,
            'created_at' => Carbon::now()->subDays(7)
        ]);

        ItemOrder::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'stock_movement_id' => $stockMovementOut->id,
            'qty' => 15,
            'created_at' => Carbon::now()->subDays(7)
        ]);

        $this->command->info("Escenario 3 creado: Orden {$order->code} - 15 cintas salieron, debe facturar y volver a la orden");
    }
}