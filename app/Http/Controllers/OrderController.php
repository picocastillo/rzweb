<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\User;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\Client;
use App\Models\File;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with('client')->get();

        return Inertia::render('orders/Index', [
            'orders' => $orders,
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

        return Inertia::render('orders/Create', [
            'clients' => $clients,
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'address' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:100',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'items' => 'nullable|array',
            'items.*.product_id' => 'required_with:items.*|exists:products,id',
            'items.*.qty' => 'required_with:items.*|numeric|min:1',
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

        //dd($order);
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

        //dd($workers);
        return Inertia::render('orders/Show', [
            'order' => $order,
            'products' => $productsInOrder,
            'allProducts' => $allProducts,
            'available_workers' => $workers,
        ]);
    }

    public function stockMovement(Request $request, $orderId)
    {
        //dd($request->all());
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'qty' => 'required|numeric|min:1',
            'type' => 'required|in:0,2', // 0: entrada, 2: salida
        ]);

        Order::addMovementStock([
            'order_id' => $orderId,
            'product_id' => $request->product_id,
            'qty' => $request->qty,
            'type' => $request->type,
        ]);

        return redirect()->back()->with('success', 'Movimiento de stock registrado correctamente!');
    }

    public function edit(Order $order)
    {
        $order->load([
            'stockMovements', 
            'client', 
            'stockMovements.product',
            'itemOrders',
            'itemOrders.product'
        ]);
        $productsInOrder = $order->itemOrders->map(function ($item) {
            return [
                'id' => $item->product->id,
                'name' => $item->product->name,
                'code' => $item->product->code,
                'current_stock' => $item->qty, // cantidad en la orden
            ];
        })->unique('id')->values();

        //dd($productsInOrder);
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
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|numeric|min:1',
        ]);

        $order->update($validated);
    }

    public function assignOrder(Request $request, Order $order)
    {
        //dd($request->all());
        $request->validate([
            'worker_id' => 'required|exists:users,id'
        ]);

        $order->assignTo($request->worker_id, $request->order->id);

        return back()->with('success', 'Orden asignada correctamente');
    }

    public function addNote(Request $request)
    {
        //dd($request->all());
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
        //dd($request->all());
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
                Storage::disk('public')->put('orders_attach/' . $name_file, file_get_contents($file));
                $o = Order::findOrFail($request->order_id);
                File::create([
                    'order_id' => $o->id,
                    'name' => $name_file,
                    //'is_private' => $request->is_private == 'on',
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

        $path = public_path('storage/orders_attach/' . $file->name);
        if (file_exists($path)) {
            unlink($path);
        }
        $file->delete();

        return back()->with('success', 'Archivo eliminado correctamente');
    }

}
