<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use function App\Helpers\TYPE_MOVEMENT;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = Product::with('stockMovements', 'costs')->get()->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'current_stock' => $product->current_stock,
                'current_cost' => $product->current_cost,
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

        try {
            
            $product->adjustStock($request->qty, $request->type);
            return redirect()->back()->with('success', 'Stock actualizado correctamente.');

        } catch (\Throwable $e) {
            \Log::error('Error al actualizar stock: '.$e->getMessage());
            return back()->with('error', 'Ocurrió un error al actualizar el stock.');
        }

        return redirect()->back()->with('success', 'Stock actualizado correctamente.');
    }

    public function addCost(Request $request, Product $product)
    {
        $request->validate([
            'price' => 'required|numeric|min:0',
        ]);

        try {
            $product->addCostToProduct($request->price);

            return redirect()->back()->with('success', 'Costo actualizado correctamente.');
        } catch (\Throwable $e) {
            \Log::error('Error al agregar costo: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Ocurrió un error al actualizar el costo.');
        }
    }
}
