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
            ->when($request->status, function ($query) use ($request) {
                $query->whereHas('itemOrders.order', function ($q) use ($request) {
                    $q->where('last_state', $request->status);
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $this->transformMovements($movements);

        return Inertia::render('reports/Index', [
            'movements' => $movements,
            'clients' => $clients,
            'filters' => $request->only(['client_id', 'status']),
            'orderStates' => $this->getOrderStates(),
        ]);
    }

    public function searchByAddress(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:2'
        ]);

        $searchTerm = $request->input('query');

        $movements = $this->getMovementsQuery()
            ->whereHas('itemOrders.order', function ($q) use ($searchTerm) {
                $q->where('address', 'LIKE', '%' . $searchTerm . '%');
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $this->transformMovements($movements);

        return Inertia::render('reports/Index', [
            'movements' => $movements,
            'clients' => Client::orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['query']),
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
     * Transforma la colección de movimientos
     */
    private function transformMovements($movements)
    {
        $movements->getCollection()->transform(function ($movement) {
            $itemOrder = $movement->itemOrders->first();
            
            return [
                'id' => $movement->id,
                'product_id' => $movement->product_id,
                'type' => $movement->type,
                'qty' => $movement->qty,
                'is_billed' => $movement->is_billed,
                'created_at' => $movement->created_at,
                'product' => $movement->product,
                'order' => $itemOrder ? $itemOrder->order : null,
            ];
        });
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