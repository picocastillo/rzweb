<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Bill;
use App\Models\Client;
use App\Models\ItemOrder;
use App\Models\Order;
use App\Models\StockMovement;
use Exception;
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

        try {
            Bill::createWithInitialState([
                'client_id' => $validated['client_id'],
                'orders' => $validated['orders'],
            ]);

            return redirect('/bills')->with('success', 'Factura creada exitosamente.');
        } catch (Exception $e) {
            return redirect()->back()
                ->with('error', $e->getMessage())
                ->withInput();
        }

    }

 public function show(Bill $bill)
    {
        // Cargar la factura con todas las relaciones necesarias
        $bill->load([
            'client',
            'billItems.stockMovement.product.costs',
            'billItems.stockMovement.product',
        ]);

        // Si necesitas información adicional de las órdenes relacionadas
        // puedes cargarlas también si tu modelo Bill tiene relación con orders
        if (method_exists($bill, 'orders')) {
            $bill->load(['orders' => function($query) {
                $query->with(['itemOrders.product']);
            }]);
        }

        // Transformar los datos si es necesario para la vista
        $billData = [
            'id' => $bill->id,
            'client_id' => $bill->client_id,
            'date_from' => $bill->date_from,
            'amount' => $bill->amount,
            'created_at' => $bill->created_at,
            'client' => $bill->client ? [
                'id' => $bill->client->id,
                'name' => $bill->client->name,
                'cuil' => $bill->client->cuil,
                'phone' => $bill->client->phone,
            ] : null,
            'bill_items' => $bill->billItems->map(function ($billItem) {
                $stockMovement = $billItem->stockMovement;
                $product = $stockMovement->product ?? null;
                
                return [
                    'id' => $billItem->id,
                    'bill_id' => $billItem->bill_id,
                    'days' => $billItem->days,
                    'stock_movement_id' => $billItem->stock_movement_id,
                    'stock_movement' => $stockMovement ? [
                        'id' => $stockMovement->id,
                        'product_id' => $stockMovement->product_id,
                        'type' => $stockMovement->type,
                        'qty' => $stockMovement->qty,
                        'created_at' => $stockMovement->created_at,
                        'product' => $product ? [
                            'id' => $product->id,
                            'name' => $product->name,
                            'current_cost' => $product->current_cost,
                            'costs' => $product->costs->map(function ($cost) {
                                return [
                                    'id' => $cost->id,
                                    'product_id' => $cost->product_id,
                                    'price' => $cost->price,
                                    'created_at' => $cost->created_at,
                                ];
                            }),
                        ] : null,
                    ] : null,
                ];
            }),
        ];

        return Inertia::render('bills/Show', [
            'bill' => $billData,
        ]);
    }
}