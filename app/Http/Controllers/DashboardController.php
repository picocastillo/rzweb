<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\Client;
use App\Models\Order;
use App\Models\Product;
use App\Models\StockMovement;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {

        // Estadísticas principales
        $activeOrders = Order::where('is_active', true)->count();

        $activeSalidas = StockMovement::activeSalidas();

        $pendingBills = $activeSalidas->count();

        $totalRevenue = Bill::sum('amount');

        $rentalQtyByProduct = $activeSalidas->groupBy('product_id')->map->sum('qty');

        $entriesByProduct = StockMovement::query()
            ->whereIn('type', [1, 0])
            ->selectRaw('product_id, SUM(qty) as total')
            ->groupBy('product_id')
            ->pluck('total', 'product_id');

        $lowStockProducts = Product::query()
            ->pluck('id')
            ->filter(function (int $productId) use ($entriesByProduct, $rentalQtyByProduct) {
                $entries = (int) ($entriesByProduct[$productId] ?? 0);
                $inRental = (int) ($rentalQtyByProduct[$productId] ?? 0);

                return ($entries - $inRental) < 5;
            })
            ->count();

        $totalClients = Client::count();

        $productsInRental = $activeSalidas->sum('qty');

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

        $topRentalByProduct = $rentalQtyByProduct
            ->sortDesc()
            ->take(5);

        $topProducts = Product::with('costs')
            ->whereIn('id', $topRentalByProduct->keys())
            ->get()
            ->map(function ($product) use ($topRentalByProduct, $entriesByProduct) {
                $inRental = (int) ($topRentalByProduct[$product->id] ?? 0);
                $entries = (int) ($entriesByProduct[$product->id] ?? 0);

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'stock_in_rental' => $inRental,
                    'available_stock' => $entries - $inRental,
                    'current_cost' => $product->current_cost ?? 0,
                ];
            })
            ->sortByDesc('stock_in_rental')
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
