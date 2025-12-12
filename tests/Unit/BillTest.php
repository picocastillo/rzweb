<?php

namespace Tests\Unit;

use App\Models\Bill;
use App\Models\Client;
use App\Models\Cost;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Role;
use App\Models\StockMovement;
use App\Models\ItemOrder;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Facades\Hash;

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
        ]);

        // Assert
        $this->assertNotNull($bill);
        $this->assertEquals(1, $bill->billItems->count());

        $billItem = $bill->billItems->first();
        $this->assertEquals(10, $billItem->days);

        // Cálculo: 5 unidades * 10 días * $100
        $this->assertEquals(5000, $bill->amount);

        // Verificar que el movimiento fue marcado como facturado
        $movement = StockMovement::where('type', 2)->first();
        $this->assertTrue((bool) $movement->is_billed);
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
        ]);

        // Assert
        $this->assertEquals(5, $bill->billItems->first()->days);
        // Cálculo: 3 unidades * 5 días * $50
        $this->assertEquals(750, $bill->amount);

        // Verificar nuevo movimiento pendiente
        $newMovement = StockMovement::where('type', 2)
            ->where('is_billed', false)
            ->first();
        $this->assertNotNull($newMovement);
        $this->assertEquals(3, $newMovement->qty);
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
        ]);

        // Act: Segunda factura (15 días DESDE la anterior)
        Carbon::setTestNow('2025-01-26 10:00:00');
        $secondBill = Bill::createWithInitialState([
            'client_id' => $client->id,
            'orders' => [$order->id],
        ]);

        // Assert
        $this->assertEquals(10, $firstBill->billItems->first()->days);
        $this->assertEquals(15, $secondBill->billItems->first()->days);
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
        $this->expectExceptionMessage('No hay movimientos pendientes para facturar');

        Bill::createWithInitialState([
            'client_id' => $client->id,
            'orders' => [$order->id],
        ]);
    }
}
