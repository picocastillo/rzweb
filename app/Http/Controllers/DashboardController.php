<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\Client;
use App\Models\Order;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {

            // Estadísticas principales
            $activeOrders = Order::where('is_active', true)->count();
            
            $pendingBills = StockMovement::where('type', 0)
                ->where('is_billed', false)
                ->count();
            
            $totalRevenue = Bill::sum('amount');
            
            // Productos con stock bajo (menos de 5 disponibles)
            $lowStockProducts = Product::with('stockMovements')
                ->get()
                ->filter(function ($product) {
                    return $product->available_stock < 5;
                })
                ->count();
            
            $totalClients = Client::count();
            
            // Total de productos actualmente en alquiler
            $productsInRental = StockMovement::where('type', 2)
                ->where('is_billed', false)
                ->sum('qty');

            // Órdenes recientes (últimas 5)
            $recentOrders = Order::with('client')
                ->where('is_active', true)
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'code' => $order->code,
                        'client_name' => $order->client->name ?? 'Sin cliente',
                        'date_from' => $order->date_from,
                        'last_state' => $order->name_last_state,
                    ];
                });

            // Productos más alquilados (top 5)
            $topProducts = Product::with(['costs', 'stockMovements'])
                ->get()
                ->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'stock_in_rental' => $product->stock_in_rental,
                        'available_stock' => $product->available_stock,
                        'current_cost' => $product->current_cost ?? 0,
                    ];
                })
                ->sortByDesc('stock_in_rental')
                ->take(5)
                ->values();
        
            return Inertia::render('dashboard', [
                'stats' => [
                    'activeOrders' => $activeOrders,
                    'pendingBills' => $pendingBills,
                    'totalRevenue' => $totalRevenue,
                    'lowStockProducts' => $lowStockProducts,
                    'totalClients' => $totalClients,
                    'productsInRental' => $productsInRental,
                ],
                'recentOrders' => $recentOrders,
                'topProducts' => $topProducts,
            ]);

    }
}
