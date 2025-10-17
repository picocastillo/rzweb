<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Order;
use App\Models\Client;
use App\Models\Product;
use App\Models\ItemOrder;
use App\Models\OrderState;
use Illuminate\Http\Request;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    function index(){
        $orders = Order::with('client')->get();

        return Inertia::render('orders/Index', [
            'orders' => $orders,
        ]);
    }

    public function create()
    {
        $clients = Client::orderBy('name')->get();
        $products = Product::with('stockMovements')->get()->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'current_stock' => $product->current_stock,
            ];
        });
        
        return Inertia::render('orders/Create', [
            'clients' => $clients,
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'address' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:100',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
        ]);

         DB::transaction(function () use ($request) {

        $order = Order::create([
            'user_id' => auth()->id(),
            'client_id' => $request->client_id,
            'address' => $request->address,
            'code' => $request->code,
            'date_from' => $request->date_from,
            'date_to' => $request->date_to,
            'last_state' => 0, // Iniciada
            'is_active' => true,
        ]);

        OrderState::create([
            'order_id' => $order->id,
            'name' => getNameStateOrder(0), // “Iniciada”
        ]);

        foreach ($request->items as $item) {
            $stock = StockMovement::create([
                'product_id' => $item['product_id'],
                'qty' => -$item['qty'], // Restamos el stock
                'type' => getNameTypeMovement(2), // “Salida por orden”
                'is_billable' => true,
            ]);

            ItemOrder::create([
                'order_id' => $order->id,
                'product_id' => $item['product_id'],
                'qty' => $item['qty'],
                'stock_movement_id' => $stock->id,
            ]);
            
        }
    });

        return redirect('/orders')->with('success', 'Order created successfully.');
    }
}
