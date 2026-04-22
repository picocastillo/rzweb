<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\File;
use App\Models\ItemOrder;
use App\Models\Note;
use App\Models\Order;
use App\Models\OrderState;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::with(['client', 'assignedTo'])
            ->when($request->search, function ($query, $search) {
                $query->where('address', 'like', "%{$search}%");
            })
            ->orderBy('id', 'desc')
            ->get();

        return Inertia::render('orders/Index', [
            'orders' => $orders,
            'filters' => $request->only('search'),
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

        $workers = User::where('role_id', 2)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('orders/Create', [
            'clients' => $clients,
            'products' => $products,
            'workers' => $workers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'address' => 'required|string|max:255',
            'code' => 'nullable|string|max:100',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'items' => 'nullable|array',
            'items.*.product_id' => 'required_with:items.*|exists:products,id',
            'items.*.qty' => 'required_with:items.*|numeric|min:1',
            'assigned_to' => [
                'nullable',
                'integer',
                Rule::exists('users', 'id')->where('role_id', 2),
            ],
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
            'itemOrders.product',
            'states',
            'notes',
            'files',
        ]);

        // dd($order);
        $productsInOrder = $order->itemOrders->map(function ($item) {
            return [
                'id' => $item->product->id,
                'name' => $item->product->name,
                'code' => $item->product->code,
                'current_stock' => $item->qty, // cantidad en la orden
            ];
        })->unique('id')->values();

        $allProducts = Product::all();
        $workers = User::where('role_id', 2)->get();
        $clients = Client::orderBy('name')->get(['id', 'name']);

        // dd($workers);
        return Inertia::render('orders/Show', [
            'order' => $order,
            'products' => $productsInOrder,
            'allProducts' => $allProducts,
            'available_workers' => $workers,
            'clients' => $clients,
        ]);
    }

    public function stockMovement(Request $request, $orderId)
    {
        // dd($request->all());
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'qty' => 'required|numeric|min:1',
            'type' => 'required|in:0,2', // 0: entrada, 2: salida
            'movement_date' => 'nullable|date',
        ]);

        $result = Order::addMovementStock([
            'order_id' => $orderId,
            'product_id' => $request->product_id,
            'qty' => $request->qty,
            'type' => $request->type,
            'movement_date' => $request->input('movement_date'),
        ]);

        $redirect = redirect()->back()->with('success', 'Movimiento de stock registrado correctamente!');

        if (! empty($result['warning'])) {
            $redirect->with('warning', $result['warning']);
        }

        return $redirect;
    }

    public function edit(Order $order)
    {
        $order->load([
            'stockMovements',
            'client',
            'stockMovements.product',
            'itemOrders',
            'itemOrders.product',
        ]);
        $productsInOrder = $order->itemOrders->map(function ($item) {
            return [
                'id' => $item->product->id,
                'name' => $item->product->name,
                'code' => $item->product->code,
                'current_stock' => $item->qty, // cantidad en la orden
            ];
        })->unique('id')->values();

        // dd($productsInOrder);
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
            'items' => 'nullable|array|min:1',
            'items.*.product_id' => 'required_with:items|exists:products,id',
            'items.*.qty' => 'required_with:items|numeric|min:1',
        ]);

        $order->update([
            'client_id' => $validated['client_id'],
            'address' => $validated['address'] ?? $order->address,
            'code' => $validated['code'] ?? $order->code,
            'date_from' => $validated['date_from'] ?? $order->date_from,
            'date_to' => $validated['date_to'] ?? $order->date_to,
        ]);

        return redirect()->back()->with('success', 'Orden actualizada correctamente!');
    }

    public function assignOrder(Request $request, Order $order)
    {
        // dd($request->all());
        $request->validate([
            'worker_id' => 'required|exists:users,id',
        ]);

        $order->assignTo((int) $request->worker_id);

        return back()->with('success', 'Orden asignada correctamente');
    }

    public function addNote(Request $request)
    {
        // dd($request->all());
        $request->validate([
            'order_id' => 'required',
            'message' => 'required',
        ]);
        if ($request->get('is_private') == '0') {
            Note::create(array_merge($request->all('order_id', 'message', 'user_id'), ['user_id' => Auth::user()->id]));
        } else {
            Note::create(array_merge($request->all('order_id', 'message', 'user_id'), ['user_id' => Auth::user()->id, 'is_private' => true]));
        }

        return back()->with('success', 'Nota registrada correctamente');
    }

    public function updateNote(Request $request, $id)
    {
        // dd($request->all());
        $request->validate([
            'message' => 'required|string|max:255',
        ]);

        $note = Note::findOrFail($id);
        $note->message = $request->message;
        $note->save();

        return back()->with('success', 'Nota actualizada correctamente');
    }

    public function attachFile(Request $request)
    {
        $request->validate([
            'file' => 'mimes:jpeg,jpg,png,pdf,ogg|required|max:10000',
            'order_id' => 'required|integer',
        ]);

        DB::beginTransaction();
        try {
            $file = $request->file('file');
            if ($file) {
                $name_file = $file->getClientOriginalName();
                Storage::disk('public')->put('orders_attach/'.$name_file, file_get_contents($file));
                $o = Order::findOrFail($request->order_id);
                File::create([
                    'order_id' => $o->id,
                    'name' => $name_file,
                    // 'is_private' => $request->is_private == 'on',
                ]);
            }
            DB::commit();

            return back()->with('success', 'Archivo cargado correctamente');
        } catch (\Exception $e) {
            DB::rollback();
            dd($e);
            abort('Error adding product', 401);
        }
    }

    public function deleteFile($id)
    {
        $file = File::findOrFail($id);

        $path = public_path('storage/orders_attach/'.$file->name);
        if (file_exists($path)) {
            unlink($path);
        }
        $file->delete();

        return back()->with('success', 'Archivo eliminado correctamente');
    }

    public function indexForWorkers()
    {
        $worker = auth()->user();
        // dd($worker);

        // Ordenes activas asignadas al trabajador
        $assignedOrders = Order::where('assigned_to', $worker->id)
            ->whereHas('states', function ($query) {
                $query->where('is_active', 1);
            })
            ->with(['client', 'states'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'code' => $order->code,
                    'address' => $order->address ?? 'Dirección no disponible',
                    'client_name' => $order->client->name ?? 'Cliente no disponible',
                    'created_at' => $order->created_at->format('d/m/Y'),
                    'status' => $order->current_state ?? 'Activa',
                ];
            });

        return Inertia::render('orders/WorkerOrders', [
            'orders' => $assignedOrders,
            'worker_name' => $worker->name,
            'total_orders' => $assignedOrders->count(),
        ]);
    }

    public function initOrder(Order $order)
    {

        $user = auth()->user();

        if ($user->role_name == 'Trabajador' || $user->role_name == 'Admin') {
            OrderState::create([
                'name' => 2, // En curso
                'order_id' => $order->id,
            ]);

            $order->update(['last_state' => 2]);

            return redirect()->back()->with('success', 'Orden iniciada correctamente');
        }
    }

    public function finishOrder(Request $request, Order $order)
    {
        $user = auth()->user();

        if ($user->role_name !== 'Trabajador' && $user->role_name !== 'Admin') {
            abort(403);
        }

        $validated = $request->validate([
            'finish_date' => 'required|date',
        ]);

        $finishAt = Carbon::parse($validated['finish_date'], config('app.timezone'))
            ->setTimeFromTimeString(now()->format('H:i:s'));

        DB::transaction(function () use ($order, $finishAt) {
            $order->loadMissing(['itemOrders.stockMovement']);

            foreach ($order->itemOrders as $itemOrder) {
                $movement = $itemOrder->stockMovement;
                if (! $movement || (int) $movement->type !== 2) {
                    continue;
                }

                if (StockMovement::firstRegresoAfterSalida($movement, $order->id)) {
                    continue;
                }

                $alta = StockMovement::create([
                    'product_id' => $movement->product_id,
                    'qty' => $movement->qty,
                    'type' => 0, // Regreso por orden
                ]);

                $alta->forceFill([
                    'created_at' => $finishAt,
                    'updated_at' => $finishAt,
                ])->save();

                ItemOrder::create([
                    'product_id' => $movement->product_id,
                    'qty' => $movement->qty,
                    'order_id' => $order->id,
                    'stock_movement_id' => $alta->id,
                ]);
            }

            OrderState::create([
                'name' => 3, // Finalizada
                'order_id' => $order->id,
            ]);

            $order->update(['last_state' => 3]);
        });

        return redirect()->back()->with('success', 'Orden finalizada correctamente');
    }
}
