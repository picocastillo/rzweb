import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

type Client = {
    id: number;
    name: string;
};
type Product = { id: number; name: string; current_stock: number };

export default function CreateOrder({ clients, products }: { clients: Client[], products: Product[] }) {
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
        setData('items', [...data.items, { product_id: currentProduct, qty: currentQty }]);
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

            <div className="max-w-lg mx-auto p-6">
                <h1 className="text-2xl font-semibold mb-4">Agregar Orden</h1>
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Cliente */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Cliente</label>
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
                        {errors.client_id && <p className="text-red-600 text-sm">{errors.client_id}</p>}
                    </div>

                    {/* Dirección */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Dirección</label>
                        <input
                            type="text"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            className="w-full rounded-lg border px-3 py-2"
                            required
                        />
                        {errors.address && <p className="text-red-600 text-sm">{errors.address}</p>}
                    </div>

                    {/* Código */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Código</label>
                        <input
                            type="text"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            className="w-full rounded-lg border px-3 py-2"
                        />
                        {errors.code && <p className="text-red-600 text-sm">{errors.code}</p>}
                    </div>

                    {/* Fecha inicio */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Fecha inicio</label>
                        <input
                            type="date"
                            value={data.date_from}
                            onChange={(e) => setData('date_from', e.target.value)}
                            className="w-full rounded-lg border px-3 py-2"
                            required
                        />
                        {errors.date_from && <p className="text-red-600 text-sm">{errors.date_from}</p>}
                    </div>

                    {/* Fecha fin */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Fecha fin</label>
                        <input
                            type="date"
                            value={data.date_to}
                            onChange={(e) => setData('date_to', e.target.value)}
                            className="w-full rounded-lg border px-3 py-2"
                        />
                        {errors.date_to && <p className="text-red-600 text-sm">{errors.date_to}</p>}
                    </div>

                    {/* Productos */}
                    <div className="border rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <select
                                value={currentProduct}
                                onChange={(e) => setCurrentProduct(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                                className="w-24 border rounded px-2 py-1"
                            />
                            <button
                                type="button"
                                onClick={addItem}
                                className="bg-sky-600 text-white px-3 py-1 rounded"
                            >
                                Agregar
                            </button>
                        </div>

                        {data.items.length > 0 && (
                            <table className="w-full text-sm border-t mt-3">
                                <thead>
                                    <tr className="text-left">
                                        <th>Producto</th>
                                        <th>Cantidad</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.items.map((item, index) => {
                                        const product = products.find((p) => p.id === Number(item.product_id));
                                        return (
                                            <tr key={index}>
                                                <td>{product?.name ?? '-'}</td>
                                                <td>{item.qty}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        className="text-red-600"
                                                    >
                                                        Quitar
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Guardar
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
