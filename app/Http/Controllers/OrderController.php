<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
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
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'address' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:100',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|numeric|min:1',
        ]);

        // Logica de negocios en el modelo
        Order::createWithInitialState([
            ...$validated,
            'user_id' => auth()->id(),
        ]);

        return redirect('/orders')->with('success', 'Order created successfully.');
    }

    public function show(Order $order)
    {
        $order->load(['stockMovements', 'client', 'stockMovements.product']);
        $productsInOrder = $order->orderItems->map(function ($item) {
            return [
                'id' => $item->product->id,
                'name' => $item->product->name,
                'sku' => $item->product->sku,
                'current_stock' => $item->qty, // cantidad en la orden
            ];
        })->unique('id')->values();

        //dd($productsInOrder);
        return Inertia::render('orders/Show', [
            'order' => $order,
            'products' => $productsInOrder,
        ]);
    }

    public function stockMovement(Request $request, $orderId)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'qty' => 'required|numeric|min:1',
        ]);

        Order::addMovementStock([
            'order_id' => $orderId,
            'product_id' => $request->product_id,
            'qty' => $request->qty,
        ]);

        return redirect()->back()->with('success', 'Stock movement recorded successfully.');
    }
}
