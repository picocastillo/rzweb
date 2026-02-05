<?php

namespace App\Http\Controllers;

use App\Models\StockMovement;
use App\Models\Client;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\In;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $clients = Client::orderBy('name')->get(['id', 'name']);
        
        $movements = $this->getMovementsQuery()
            ->when($request->client_id, function ($query) use ($request) {
                $query->whereHas('itemOrders.order', function ($q) use ($request) {
                    $q->where('client_id', $request->client_id);
                });
            })
            // Filtro por estado de orden
            ->when($request->status, function ($query) use ($request) {
                $query->whereHas('itemOrders.order', function ($q) use ($request) {
                    $q->where('last_state', $request->status);
                });
            })
            // Filtro por fecha de inicio
            ->when($request->start_date, function ($query) use ($request) {
                $query->whereHas('itemOrders.order', function ($q) use ($request) {
                    $q->whereDate('date_from', '>=', $request->start_date);
                });
            })
            // Filtro por fecha de fin
            ->when($request->end_date, function ($query) use ($request) {
                $query->whereHas('itemOrders.order', function ($q) use ($request) {
                    $q->whereDate('date_to', '<=', $request->end_date);
                });
            })
            // Filtro por dirección
            ->when($request->address, function ($query) use ($request) {
                $query->whereHas('itemOrders.order', function ($q) use ($request) {
                    $q->where('address', 'like', '%' . $request->address . '%');
                });
            })
            ->orderBy('created_at', 'desc')
            ->get();

        // Agrupamos y transformamos
        $groupedMovements = $this->groupAndTransformMovements($movements);
        
        // Paginamos manualmente
        $page = $request->get('page', 1);
        $perPage = 20;
        $paginatedMovements = new \Illuminate\Pagination\LengthAwarePaginator(
            $groupedMovements->forPage($page, $perPage),
            $groupedMovements->count(),
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return Inertia::render('reports/Index', [
            'movements' => $paginatedMovements,
            'clients' => $clients,
            'filters' => $request->only(['client_id', 'status', 'start_date', 'end_date', 'address']),
            'orderStates' => $this->getOrderStates(),
        ]);
    }

    /**
     * Query base para obtener movimientos con sus relaciones
     */
    private function getMovementsQuery()
    {
        return StockMovement::query()
            ->has('itemOrders')
            ->with([
                'product:id,name',
                'itemOrders.order:id,client_id,address,date_from,date_to,last_state',
                'itemOrders.order.client:id,name',
                'itemOrders.order.states' => function($query) {
                    $query->orderBy('id', 'desc')->limit(1);
                }
            ]);
    }

    /**
     * Agrupa movimientos por orden e item, separando instalación y retiro
     */
    private function groupAndTransformMovements($movements)
    {
        // Agrupar por order_id + product_id
        $grouped = $movements->groupBy(function($movement) {
            $itemOrder = $movement->itemOrders->first();
            return $itemOrder?->order_id . '_' . $movement->product_id;
        });

        $result = collect();

        foreach ($grouped as $key => $movementGroup) {
            $itemOrder = $movementGroup->first()->itemOrders->first();
            
            if (!$itemOrder || !$itemOrder->order) continue;

            // Buscamos movimiento de salida (type = 2) e ingreso (type = 0)
            $outMovement = $movementGroup->firstWhere('type', 2);
            $inMovement = $movementGroup->firstWhere('type', 0);
            
            $order = $itemOrder->order;
            $product = $movementGroup->first()->product;

            $result->push([
                'id' => $movementGroup->first()->id,
                'product_id' => $product->id,
                'type' => $movementGroup->first()->type,
                'qty' => $movementGroup->sum('qty'), // Suma de cantidades
                'created_at' => $outMovement?->created_at ?? $inMovement?->created_at,
                'product' => [
                    'name' => $product->name,
                    'current_cost' => $product->current_cost,
                ],
                'order' => [
                    'id' => $order->id,
                    'client' => $order->client,
                    'address' => $order->address,
                    'name_last_state' => $order->name_last_state,
                    'date_from' => $outMovement?->created_at, // Instalación (type = 2)
                    'date_to' => $inMovement?->created_at,     // Retiro (type = 0)
                ],
            ]);
        }

        return $result->sortByDesc('created_at')->values();
    }

    /**
     * Obtiene los estados de orden formateados
     */
    private function getOrderStates()
    {
        return collect(STATES)->map(function ($label, $value) {
            return [
                'value' => (string) $value,
                'label' => $label,
            ];
        })->values();
    }
}