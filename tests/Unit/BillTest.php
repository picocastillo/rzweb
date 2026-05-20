<?php

namespace Tests\Unit;

use App\Models\Bill;
use App\Models\Client;
use App\Models\Cost;
use App\Models\ItemOrder;
use App\Models\Order;
use App\Models\Product;
use App\Models\Role;
use App\Models\StockMovement;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class BillTest extends TestCase
{
    use RefreshDatabase;

    // Helper privado para crear producto con precio correctamente
    private function createProductWithCost($price)
    {
        $product = Product::create(['name' => 'Vallas largas']);

        Cost::create([
            'product_id' => $product->id,
            'price' => $price,
        ]);

        return $product;
    }

    public function test_puede_facturar_orden_con_devolucion_completa()
    {
        // Arrange
        Role::forceCreate(
            [
                'id' => 1,
                'name' => 'admin',
            ]
        );
        $admin = User::firstOrCreate(
            ['email' => 'admin@test.com'],
            [
                'name' => 'Admin',
                'role_id' => 1,
                'password' => Hash::make('asdasd'),
                'email_verified_at' => now(),
            ]
        );
        $client = Client::firstOrCreate(
            ['email' => 'cliente@test.com'],
            [
                'name' => 'Cliente Test',
                'cuil' => '20-12345678-9',
                'phone' => '+54 9 11 1234-5678',
            ]
        );

        // CORRECCIÓN: Creamos el costo en la tabla relacionada, no en el producto
        $product = $this->createProductWithCost(100);

        $order = Order::create([
            'user_id' => $admin->id,
            'client_id' => $client->id,
            'code' => 'ORD-001',
            'address' => 'Av. Corrientes 1234, CABA',
            'last_state' => 0,
            'is_active' => true,
            'date_from' => '2025-01-10',
            'date_to' => '2025-01-20',
        ]);

        // Movimiento de entrada (Entrega al cliente)
        Carbon::setTestNow('2025-01-10 10:00:00');
        $stockMovementIn = StockMovement::create([
            'product_id' => $product->id,
            'qty' => 5,
            'type' => 2,
            'order_id' => $order->id,
        ]);

        // Item de la orden
        ItemOrder::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'stock_movement_id' => $stockMovementIn->id,
            'qty' => 10,
        ]);

        // Movimiento de salida (Devolución del cliente) - 10 días después
        Carbon::setTestNow('2025-01-20 10:00:00');
        $stockMovementOut = StockMovement::create([
            'product_id' => $product->id,
            'qty' => 5,
            'type' => 0,
            'order_id' => $order->id,
        ]);

        // Item de la orden
        ItemOrder::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'stock_movement_id' => $stockMovementOut->id,
            'qty' => 10,
        ]);

        // Act: Facturar
        Carbon::setTestNow('2025-01-25 10:00:00');
        $bill = Bill::createWithInitialState([
            'client_id' => $client->id,
            'orders' => [$order->id],
            'date_from' => '2025-01-10',
            'date_to' => '2025-01-20',
        ]);

        // Assert
        $this->assertNotNull($bill);
        $this->assertEquals(1, $bill->billItems->count());

        $billItem = $bill->billItems->first();
        $this->assertEquals(11, $billItem->days);

        // Cálculo: 5 unidades * 11 días * $100
        $this->assertEquals(5500, $bill->amount);

        $this->assertEquals($stockMovementIn->id, $billItem->stock_movement_id);
    }

    public function test_puede_facturar_orden_parcial_sin_devolucion()
    {
        // Arrange
        Role::forceCreate(
            [
                'id' => 1,
                'name' => 'admin',
            ]
        );
        $admin = User::firstOrCreate(
            ['email' => 'admin@test.com'],
            [
                'name' => 'Admin',
                'role_id' => 1,
                'password' => Hash::make('asdasd'),
                'email_verified_at' => now(),
            ]
        );
        $client = Client::firstOrCreate(
            ['email' => 'cliente@test.com'],
            [
                'name' => 'Cliente Test',
                'cuil' => '20-12345678-9',
                'phone' => '+54 9 11 1234-5678',
            ]
        );
        // CORRECCIÓN: Precio 50 en tabla costos
        $product = $this->createProductWithCost(50);

        $order = Order::create([
            'user_id' => $admin->id,
            'client_id' => $client->id,
            'code' => 'ORD-001',
            'address' => 'Av. Corrientes 1234, CABA',
            'last_state' => 0,
            'is_active' => true,
            'date_from' => '2025-01-10',
            'date_to' => '2025-01-20',
        ]);

        // Movimiento de entrada
        Carbon::setTestNow('2025-01-10 10:00:00');
        $stockMovementIn = StockMovement::create([
            'product_id' => $product->id,
            'qty' => 3,
            'type' => 2,
            'order_id' => $order->id,
        ]);
        // Item de la orden
        ItemOrder::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'stock_movement_id' => $stockMovementIn->id,
            'qty' => 10,
        ]);
        // Act: Facturar 5 días después
        Carbon::setTestNow('2025-01-15 10:00:00');
        $bill = Bill::createWithInitialState([
            'client_id' => $client->id,
            'orders' => [$order->id],
            'date_from' => '2025-01-10',
            'date_to' => '2025-01-15',
        ]);

        // Assert
        $this->assertEquals(6, $bill->billItems->first()->days);
        // Cálculo: 3 unidades * 6 días * $50
        $this->assertEquals(900, $bill->amount);

        $this->assertEquals(2, StockMovement::where('type', 2)->count());
        $this->assertEquals(1, StockMovement::where('type', 0)->count());
    }

    public function test_calcula_dias_desde_ultima_factura_en_facturacion_parcial_recurrente()
    {
        // Arrange
        Role::forceCreate(
            [
                'id' => 1,
                'name' => 'admin',
            ]
        );
        $admin = User::firstOrCreate(
            ['email' => 'admin@test.com'],
            [
                'name' => 'Admin',
                'role_id' => 1,
                'password' => Hash::make('asdasd'),
                'email_verified_at' => now(),
            ]
        );
        $client = Client::firstOrCreate(
            ['email' => 'cliente@test.com'],
            [
                'name' => 'Cliente Test',
                'cuil' => '20-12345678-9',
                'phone' => '+54 9 11 1234-5678',
            ]
        );
        $product = $this->createProductWithCost(100);

        $order = Order::create([
            'user_id' => $admin->id,
            'client_id' => $client->id,
            'code' => 'ORD-001',
            'address' => 'Av. Corrientes 1234, CABA',
            'last_state' => 0,
            'is_active' => true,
            'date_from' => '2025-01-10',
            'date_to' => '2025-01-20',
        ]);

        Carbon::setTestNow('2025-01-01 10:00:00');
        $stockMovementIn = StockMovement::create([
            'product_id' => $product->id,
            'qty' => 2,
            'type' => 2,
            'order_id' => $order->id,
        ]);
        // Item de la orden
        ItemOrder::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'stock_movement_id' => $stockMovementIn->id,
            'qty' => 10,
        ]);
        // Primera factura (10 días)
        Carbon::setTestNow('2025-01-11 10:00:00');
        $firstBill = Bill::createWithInitialState([
            'client_id' => $client->id,
            'orders' => [$order->id],
            'date_from' => '2025-01-01',
            'date_to' => '2025-01-11',
        ]);

        // Act: Segunda factura (15 días DESDE la anterior)
        Carbon::setTestNow('2025-01-26 10:00:00');
        $secondBill = Bill::createWithInitialState([
            'client_id' => $client->id,
            'orders' => [$order->id],
            'date_from' => '2025-01-11',
            'date_to' => '2025-01-26',
        ]);

        // Assert
        $this->assertEquals(11, $firstBill->billItems->first()->days);
        $this->assertEquals(16, $secondBill->billItems->first()->days);
    }

    public function test_lanza_excepcion_si_no_hay_movimientos_pendientes()
    {
        Role::forceCreate(
            [
                'id' => 1,
                'name' => 'admin',
            ]
        );
        $admin = User::firstOrCreate(
            ['email' => 'admin@test.com'],
            [
                'name' => 'Admin',
                'role_id' => 1,
                'password' => Hash::make('asdasd'),
                'email_verified_at' => now(),
            ]
        );
        $client = Client::firstOrCreate(
            ['email' => 'cliente@test.com'],
            [
                'name' => 'Cliente Test',
                'cuil' => '20-12345678-9',
                'phone' => '+54 9 11 1234-5678',
            ]
        );
        $order = Order::create([
            'user_id' => $admin->id,
            'client_id' => $client->id,
            'code' => 'ORD-001',
            'address' => 'Av. Corrientes 1234, CABA',
            'last_state' => 0,
            'is_active' => true,
            'date_from' => '2025-01-10',
            'date_to' => '2025-01-20',
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('No hay movimientos de salida para facturar');

        Bill::createWithInitialState([
            'client_id' => $client->id,
            'orders' => [$order->id],
            'date_from' => '2025-01-01',
            'date_to' => '2025-01-31',
        ]);
    }

    public function test_factura_varios_movimientos_y_crea_multiples_billitems()
    {
        // Arrange
        Role::forceCreate(
            [
                'id' => 1,
                'name' => 'admin',
            ]
        );
        $admin = User::firstOrCreate(
            ['email' => 'admin@test.com'],
            [
                'name' => 'Admin',
                'role_id' => 1,
                'password' => Hash::make('asdasd'),
                'email_verified_at' => now(),
            ]
        );
        $client = Client::firstOrCreate(
            ['email' => 'cliente@test.com'],
            [
                'name' => 'Cliente Test',
                'cuil' => '20-12345678-9',
                'phone' => '+54 9 11 1234-5678',
            ]
        );

        // CORRECCIÓN: Creamos el costo en la tabla relacionada, no en el producto
        $product = $this->createProductWithCost(100);

        $order = Order::create([
            'user_id' => $admin->id,
            'client_id' => $client->id,
            'code' => 'ORD-001',
            'address' => 'Av. Corrientes 1234, CABA',
            'last_state' => 0,
            'is_active' => true,
            'date_from' => '2025-01-10',
            'date_to' => '2025-01-20',
        ]);

        // Movimiento 1
        Carbon::setTestNow('2025-01-01 10:00:00');
        $m1 = StockMovement::create([
            'product_id' => $product->id,
            'qty' => 2,
            'type' => 2,
            'order_id' => $order->id,
        ]);
        ItemOrder::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'qty' => 2,
            'stock_movement_id' => $m1->id,
        ]);

        // Movimiento 2
        Carbon::setTestNow('2025-01-03 10:00:00');
        $m2 = StockMovement::create([
            'product_id' => $product->id,
            'qty' => 1,
            'type' => 2,
            'order_id' => $order->id,
        ]);
        ItemOrder::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'qty' => 1,
            'stock_movement_id' => $m2->id,
        ]);

        // Factura
        Carbon::setTestNow('2025-01-10 10:00:00');
        $bill = Bill::createWithInitialState([
            'client_id' => $client->id,
            'orders' => [$order->id],
            'date_from' => '2025-01-01',
            'date_to' => '2025-01-10',
        ]);

        $this->assertCount(2, $bill->billItems);
        $this->assertEquals(10, $bill->billItems[0]->days);
        $this->assertEquals(8, $bill->billItems[1]->days);

        // Total = (2×10×100) + (1×8×100)
        $this->assertEquals(2800, $bill->amount);
    }
}
