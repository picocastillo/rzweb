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

        return redirect('/orders')->with('success', 'Orden creada exitosamente!');
    }

    public function show(Order $order)
    {
        $order->load([
            'stockMovements', 
            'client', 
            'stockMovements.product',
            'itemOrders',
            'itemOrders.product'
        ]);
        $productsInOrder = $order->itemOrders->map(function ($item) {
            return [
                'id' => $item->product->id,
                'name' => $item->product->name,
                'code' => $item->product->code,
                'current_stock' => $item->qty, // cantidad en la orden
            ];
        })->unique('id')->values();

        $allProducts = Product::all();

        //dd($productsInOrder);
        return Inertia::render('orders/Show', [
            'order' => $order,
            'products' => $productsInOrder,
            'allProducts' => $allProducts,
        ]);
    }

    public function stockMovement(Request $request, $orderId)
    {
        //dd($request->all());
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'qty' => 'required|numeric|min:1',
            'type' => 'required|in:0,2', // 0: entrada, 2: salida
        ]);

        Order::addMovementStock([
            'order_id' => $orderId,
            'product_id' => $request->product_id,
            'qty' => $request->qty,
            'type' => $request->type,
        ]);

        return redirect()->back()->with('success', 'Movimiento de stock registrado correctamente!');
    }

    public function edit(Order $order)
    {
        $order->load([
            'stockMovements', 
            'client', 
            'stockMovements.product',
            'itemOrders',
            'itemOrders.product'
        ]);
        $productsInOrder = $order->itemOrders->map(function ($item) {
            return [
                'id' => $item->product->id,
                'name' => $item->product->name,
                'code' => $item->product->code,
                'current_stock' => $item->qty, // cantidad en la orden
            ];
        })->unique('id')->values();

        //dd($productsInOrder);
        return Inertia::render('orders/Edit', [
            'order' => $order,
            'products' => $productsInOrder,
        ]);
    }

    public function destroy(Order $order)
    {
        $order->delete();

        return redirect('/orders')->with('success', 'Orden eliminada correctamente!');
    }

    public function update(Request $request, Order $order)
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

        $order->update($validated);
    }
}
