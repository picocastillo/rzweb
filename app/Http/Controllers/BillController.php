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
        $clients = Client::with([
            'orders' => function ($q) {
                $q->where('is_active', true)
                ->with(['stockMovements' => function ($q) {
                    $q->where('is_billed', false)
                        ->with('product');
                }]);
            }
        ])->get();

        return Inertia::render('bills/Index', [
            'clients' => $clients,
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
                ->with('orderItems')
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
                        ];
                    });
            }
        }

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
        ]);

        Bill::createWithInitialState([
            'client_id' => $validated['client_id'],
        ]);

        return redirect('/bills')->with('success', 'Factura creada exitosamente.');
    }
}