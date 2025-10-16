<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use function App\Helpers\TYPE_MOVEMENT;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = Product::with('stockMovements')->get()->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'current_stock' => $product->current_stock,
            ];
        });

        return Inertia::render('products/Index', [
            'products' => $products,
            'typeMovement' => TYPE_MOVEMENT,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('products/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        Product::create([
            'name' => $request->name,
        ]);

        return redirect('/products')->with('success', 'Producto creado correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        return Inertia::render('products/Show', [
            'product' => $product,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        return Inertia::render('products/Edit', [
            'product' => $product,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $product->update([
            'name' => $request->name,
        ]);

        return redirect('/products')->with('success', 'Producto actualizado correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return redirect('/products')->with('success', 'Producto eliminado correctamente.');
    }

    public function addStock(Request $request, Product $product)
    {
        //dd($request->all());
        $request->validate([
            'qty' => 'required|integer',
            'type' => 'required|integer|in:0,1,2',
        ]);

        switch ($request->type) {
            case 0: // Regreso Por Orden -> suma
            case 1: // Alta Stock -> suma 
                $qty = $request->qty;
                break;
            case 2: // Salida Por Orden -> resta 
                $qty = -$request->qty;
                break;
            default:
                throw new \Exception('Tipo de movimiento inválido');
        }

        $product->stockMovements()->create([
            'qty' => $qty,
            'type' => $request->type,
            'is_billable' => true,
        ]);

        return redirect()->back()->with('success', 'Stock actualizado correctamente.');
    }
}
