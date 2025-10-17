<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Bill;
use App\Models\Client;
use App\Models\Order;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BillController extends Controller
{
    public function index()
    {
        $bills = Bill::with('client')
            ->latest()
            ->get();

        return Inertia::render('bills/Index', [
            'bills' => $bills,
        ]);
    }

    public function create()
    {
        $clients = Client::orderBy('name')->get();
        
        // Fechas predefinidas para el mes actual
        $defaultDateFrom = now()->startOfMonth()->format('Y-m-d');
        $defaultDateTo = now()->endOfMonth()->format('Y-m-d');

        return Inertia::render('bills/Create', [
            'clients' => $clients,
            'defaultDateFrom' => $defaultDateFrom,
            'defaultDateTo' => $defaultDateTo,
        ]);
    }

    public function getBillableItems(Request $request)
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
        ]);

        // aca obtenemos las ordenes en el rango de fechas
        $orders = Order::where('client_id', $request->client_id)
            ->where('is_active', true)
            ->whereBetween('date_from', [$request->date_from, $request->date_to])
            ->with(['items.product', 'items.stockMovement'])
            ->get();

        // aca obtenemos los movimientos de stock 
        $billableItems = [];
        $totalAmount = 0;

        foreach ($orders as $order) {
            foreach ($order->items as $item) {
                if ($item->stockMovement && $item->stockMovement->is_billable) {
                    $price = $item->product->price ?? 0;
                    $subtotal = $price * $item->qty;
                    
                    $billableItems[] = [
                        'order_id' => $order->id,
                        'order_code' => $order->code,
                        'product_id' => $item->product_id,
                        'product_name' => $item->product->name,
                        'qty' => $item->qty,
                        'price' => $price,
                        'subtotal' => $subtotal,
                        'address' => $order->address,
                        'date_from' => $order->date_from,
                        'date_to' => $order->date_to,
                    ];
                    
                    $totalAmount += $subtotal;
                }
            }
        }

        return response()->json([
            'items' => $billableItems,
            'total_amount' => $totalAmount,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
            'amount' => 'required|numeric|min:0',
            'name' => 'required|string|max:255',
            'cuil' => 'required|string|max:20',
            'phone' => 'nullable|string|max:20',
        ]);

        DB::transaction(function () use ($request) {
            $bill = Bill::create([
                'client_id' => $request->client_id,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
                'amount' => $request->amount,
                'name' => $request->name,
                'cuil' => $request->cuil,
                'phone' => $request->phone,
            ]);

            // Aca los marcariamos como facturados
            if ($request->has('order_ids')) {
                StockMovement::whereIn('id', function($query) use ($request) {
                    $query->select('stock_movement_id')
                        ->from('item_orders')
                        ->whereIn('order_id', $request->order_ids);
                })->update(['is_billable' => false]);
            }
        });

        return redirect('/bills')->with('success', 'Factura creada exitosamente.');
    }
}