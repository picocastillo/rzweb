<?php

namespace App\Http\Controllers;

use App\Models\StockMovement;
use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $clients = Client::orderBy('name')->get(['id', 'name']);
        
        // Determinar el tipo de vista: 'general' o 'daily'
        $viewType = $request->get('view_type', 'general');
        
        if ($viewType === 'daily') {
            return $this->dailyReport($request, $clients);
        }
        
        return $this->generalReport($request, $clients);
    }

    /**
     * Informe general (vista original)
     */
    private function generalReport(Request $request, $clients)
    {
        $movements = $this->getMovementsQuery()
            ->when($request->client_id, function ($query) use ($request) {
                $query->whereHas('itemOrders.order', function ($q) use ($request) {
                    $q->where('client_id', $request->client_id);
                });
            })
            ->when($request->status, function ($query) use ($request) {
                $query->whereHas('itemOrders.order', function ($q) use ($request) {
                    $q->where('last_state', $request->status);
                });
            })
            ->when($request->start_date, function ($query) use ($request) {
                $query->whereHas('itemOrders.order', function ($q) use ($request) {
                    $q->whereDate('date_from', '>=', $request->start_date);
                });
            })
            ->when($request->end_date, function ($query) use ($request) {
                $query->whereHas('itemOrders.order', function ($q) use ($request) {
                    $q->whereDate('date_to', '<=', $request->end_date);
                });
            })
            ->when($request->address, function ($query) use ($request) {
                $query->whereHas('itemOrders.order', function ($q) use ($request) {
                    $q->where('address', 'like', '%' . $request->address . '%');
                });
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $groupedMovements = $this->groupAndTransformMovements($movements);
        
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
            'viewType' => 'general',
        ]);
    }

    /**
     * Informe diario con separación de instalaciones y retiros
     */
    private function dailyReport(Request $request, $clients)
    {
        $date = $request->get('daily_date', now()->format('Y-m-d'));
        $clientId = $request->get('client_id');

        // Movimientos de instalación (type = 2 - salida de stock)
        $installations = $this->getMovementsQuery()
            ->where('type', 2)
            ->whereDate('created_at', $date)
            ->when($clientId, function ($query) use ($clientId) {
                $query->whereHas('itemOrders.order', function ($q) use ($clientId) {
                    $q->where('client_id', $clientId);
                });
            })
            ->orderBy('created_at', 'asc')
            ->get();

        // Movimientos de retiro (type = 0 - ingreso a stock)
        $removals = $this->getMovementsQuery()
            ->where('type', 0)
            ->whereDate('created_at', $date)
            ->when($clientId, function ($query) use ($clientId) {
                $query->whereHas('itemOrders.order', function ($q) use ($clientId) {
                    $q->where('client_id', $clientId);
                });
            })
            ->orderBy('created_at', 'asc')
            ->get();

        // Transformar movimientos para la vista
        $installationsFormatted = $this->formatDailyMovements($installations);
        $removalsFormatted = $this->formatDailyMovements($removals);

        return Inertia::render('reports/Index', [
            'installations' => $installationsFormatted,
            'removals' => $removalsFormatted,
            'clients' => $clients,
            'filters' => [
                'daily_date' => $date,
                'client_id' => $clientId,
            ],
            'viewType' => 'daily',
        ]);
    }

    /**
     * Formatea movimientos para el informe diario
     */
    private function formatDailyMovements($movements)
    {
        return $movements->map(function ($movement) {
            $itemOrder = $movement->itemOrders->first();
            $order = $itemOrder?->order;

            return [
                'id' => $movement->id,
                'created_at' => $movement->created_at,
                'qty' => $movement->qty,
                'product' => [
                    'id' => $movement->product->id,
                    'name' => $movement->product->name,
                    //'code' => $movement->product->code ?? null, // Asumiendo que tienes un campo 'code' en products
                    //'current_cost' => $movement->product->current_cost,
                ],
                'order' => $order ? [
                    'id' => $order->id,
                    'code' => $order->code ?? null,
                    'address' => $order->address,
                    'name_last_state' => $order->name_last_state,
                    'client' => [
                        'id' => $order->client->id,
                        'name' => $order->client->name,
                    ],
                ] : null,
            ];
        })->values();
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
                'itemOrders.order:id,code,client_id,address,date_from,date_to,last_state',
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
        $grouped = $movements->groupBy(function($movement) {
            $itemOrder = $movement->itemOrders->first();
            return $itemOrder?->order_id . '_' . $movement->product_id;
        });

        $result = collect();

        foreach ($grouped as $key => $movementGroup) {
            $itemOrder = $movementGroup->first()->itemOrders->first();
            
            if (!$itemOrder || !$itemOrder->order) continue;

            $outMovement = $movementGroup->firstWhere('type', 2);
            $inMovement = $movementGroup->firstWhere('type', 0);
            
            $order = $itemOrder->order;
            $product = $movementGroup->first()->product;

            $result->push([
                'id' => $movementGroup->first()->id,
                'product_id' => $product->id,
                'type' => $movementGroup->first()->type,
                'qty' => $movementGroup->sum('qty'),
                'created_at' => $outMovement?->created_at ?? $inMovement?->created_at,
                'product' => [
                    'name' => $product->name,
                    //'current_cost' => $product->current_cost,
                ],
                'order' => [
                    'id' => $order->id,
                    'client' => $order->client,
                    'address' => $order->address,
                    'name_last_state' => $order->name_last_state,
                    'date_from' => $outMovement?->created_at,
                    'date_to' => $inMovement?->created_at,
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