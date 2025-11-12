import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

type Client = {
    id: number;
    name: string;
};

type Product = {
    id: number;
    name: string;
    current_stock: number;
};

export default function CreateOrder({ clients, products }: { clients: Client[]; products: Product[] }) {
    const [currentProduct, setCurrentProduct] = useState('');
    const [currentQty, setCurrentQty] = useState(1);

    const { data, setData, post, processing, errors } = useForm({
        client_id: '',
        address: '',
        code: '',
        date_from: '',
        date_to: '',
        is_active: true,
        items: [] as { product_id: string; qty: number }[],
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Órdenes', href: '/orders' },
        { title: 'Nuevo', href: '/orders/create' },
    ];

    const addItem = () => {
        if (!currentProduct || currentQty <= 0) return;

        const existingItemIndex = data.items.findIndex((item) => item.product_id === currentProduct);

        if (existingItemIndex !== -1) {
            // Si ya existe, sumamos la cantidad
            const updatedItems = data.items.map((item, index) =>
                index === existingItemIndex ? { ...item, qty: item.qty + currentQty } : item
            );
            setData('items', updatedItems);
        } else {
            // Si no existe, lo agregamos normalmente
            setData('items', [
                ...data.items,
                {
                    product_id: currentProduct,
                    qty: currentQty,
                },
            ]);
        }

        // Limpiamos los campos
        setCurrentProduct('');
        setCurrentQty(1);
    };

    const removeItem = (index: number) => {
        setData('items', data.items.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/orders', { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva Orden" />
            <div className="max-w-6xl mx-auto p-6">
                <h1 className="text-2xl font-semibold mb-6">Agregar Orden</h1>
                
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Columna izquierda - Datos del formulario */}
                        <div className="lg:basis-1/2 space-y-4">
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                <h2 className="text-lg font-medium mb-4">Información de la Orden</h2>
                                
                                {/* Cliente */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">Cliente</label>
                                    <select
                                        value={data.client_id}
                                        onChange={(e) => setData('client_id', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        required
                                    >
                                        <option value="">Seleccionar cliente</option>
                                        {clients.map((client) => (
                                            <option key={client.id} value={client.id}>
                                                {client.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.client_id && <p className="text-red-600 text-sm mt-1">{errors.client_id}</p>}
                                </div>

                                {/* Dirección */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">Dirección</label>
                                    <input
                                        type="text"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 dark:bg-gray-700 dark:text-white"
                                        required
                                    />
                                    {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
                                </div>

                                {/* Código */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">Código</label>
                                    <input
                                        type="text"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 dark:bg-gray-700 dark:text-white"
                                    />
                                    {errors.code && <p className="text-red-600 text-sm mt-1">{errors.code}</p>}
                                </div>

                                {/* Fechas */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Fecha inicio */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Fecha inicio</label>
                                        <input
                                            type="date"
                                            value={data.date_from}
                                            onChange={(e) => setData('date_from', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                        {errors.date_from && <p className="text-red-600 text-sm mt-1">{errors.date_from}</p>}
                                    </div>

                                    {/* Fecha fin */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Fecha fin</label>
                                        <input
                                            type="date"
                                            value={data.date_to}
                                            onChange={(e) => setData('date_to', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 dark:bg-gray-700 dark:text-white"
                                        />
                                        {errors.date_to && <p className="text-red-600 text-sm mt-1">{errors.date_to}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Columna derecha - Carrito */}
                        <div className="lg:basis-1/2">
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                <h2 className="text-lg font-medium mb-4">Productos</h2>
                                
                                {/* Selector de productos */}
                                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                                    <select
                                        value={currentProduct}
                                        onChange={(e) => setCurrentProduct(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Seleccionar producto</option>
                                        {products.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} (Stock: {p.current_stock})
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        min={1}
                                        value={currentQty}
                                        onChange={(e) => setCurrentQty(Number(e.target.value))}
                                        className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                    />
                                    <Button type="button" onClick={addItem} variant={'success'} className="whitespace-nowrap">
                                        Agregar
                                    </Button>
                                </div>

                                {/* Lista de productos agregados */}
                                {data.items.length > 0 ? (
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="text-left p-3 font-medium">Producto</th>
                                                    <th className="text-left p-3 font-medium">Cantidad</th>
                                                    <th className="w-16"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.items.map((item, index) => {
                                                    const product = products.find((p) => p.id === Number(item.product_id));
                                                    return (
                                                        <tr key={index} className="border-t border-gray-200 dark:border-gray-600">
                                                            <td className="p-3">{product?.name ?? '-'}</td>
                                                            <td className="p-3">{item.qty}</td>
                                                            <td className="p-3">
                                                                <Button
                                                                    type="button"
                                                                    onClick={() => removeItem(index)}
                                                                    variant={'destructive'}
                                                                    size="sm"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <p>No hay productos agregados</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Botón de guardar */}
                    <div className="mt-6">
                        <Button disabled={processing} variant={'success'} size="lg">
                            {processing ? 'Guardando...' : 'Guardar Orden'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}