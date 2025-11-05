<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Bill;
use App\Models\Client;
use App\Models\ItemOrder;
use App\Models\Order;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BillController extends Controller
{
    public function index()
    {
        $bills = Bill::with([
            'client',
            'billItems.stockMovement.product.costs'
        ])
        ->latest('created_at')
        ->get();
        //dd($bills);

        return Inertia::render('bills/Index', [
            'bills' => $bills,
        ]);
    }

    public function create(Request $request)
    {
        $clients = Client::orderBy('name')->get();
        $orders = collect();
        $items = collect();

        if ($request->has('client_id')) {
            $orders = Order::where('is_active', true)
                ->where('client_id', $request->client_id)
                ->with('itemOrders')
                ->get();

            // Cargar items de TODAS las órdenes del cliente
            $orderIds = $orders->pluck('id');
            
            if ($orderIds->isNotEmpty()) {
                $items = ItemOrder::whereIn('order_id', $orderIds)
                    ->with('product')
                    ->get()
                    ->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'order_id' => $item->order_id,
                            'stock_movement_id' => $item->stock_movement_id ?? 0,
                            'product_name' => $item->product->name ?? 'Producto no encontrado',
                            'quantity' => $item->qty,
                            'current_cost' => $item->product->current_cost ?? 0,
                        ];
                    });
            }
        }

        //dd($items);

        return Inertia::render('bills/Create', [
            'clients' => $clients,
            'orders' => $orders,
            'items' => $items,
            'selectedClientId' => $request->client_id,
        ]);
    }

    public function store(Request $request)
    {
        //dd($request->all());
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'orders' => 'required|array|min:1',
            'orders.*' => 'required|exists:orders,id',
        ]);

        Bill::createWithInitialState([
            'client_id' => $validated['client_id'],
            'orders' => $validated['orders'],
        ]);

        return redirect('/bills')->with('success', 'Factura creada exitosamente.');
    }
}