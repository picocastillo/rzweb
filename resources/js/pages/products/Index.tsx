import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { DollarSign, Edit, Eye, Plus, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';

type Product = {
    id: number;
    name: string;
    current_stock: number | null;
    current_cost: number | null;
};

export default function ProductsIndex({
    products,
}: {
    products: Product[];
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalCostOpen, setIsModalCostOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<{
        product_id: number | string;
        qty: string;
        price: string;
    }>({
        product_id: '',
        qty: '',
        price: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Productos', href: '/products' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.product_id) {
            return;
        }

        post(`/products/${data.product_id}/add-stock`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
        });
    };

    const handleSubmitCost = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.product_id || !data.price) return;

        post(`/products/${data.product_id}/add-cost`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsModalCostOpen(false);
                reset();
            },
        });
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Productos" />

            <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Productos</h1>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            variant={'success'}
                        >
                            <Plus size={18} /> Agregar Stock
                        </Button>
                        <Button
                            onClick={() => router.visit('/products/create')}
                            variant={'warning'}
                        >
                            <Plus size={18} /> Nuevo Producto
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-lg border">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nombre
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Stock Actual
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Costo por dia
                                </th>
                                <th className="px-6 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td className="px-6 py-3">
                                        {product.name}
                                    </td>
                                    <td className="px-6 py-3">
                                        {product.current_stock}
                                    </td>
                                    <td className="px-6 py-3">
                                        {product.current_cost !== null ? `$${product.current_cost}` : '—'}
                                    </td>
                                    <td className="space-x-2 px-6 py-3 text-center">
                                        <Button
                                            onClick={() => router.visit(`/products/${product.id}`)}
                                            title="Ver"
                                            variant={'default'}
                                            type="button"
                                        >
                                            <Eye size={16} />
                                        </Button>
                                        <Button
                                            title="Editar"
                                            variant={'info'}
                                            onClick={() => router.visit(`/products/${product.id}/edit`)}
                                            type="button"
                                        >
                                            <Edit size={16} />
                                        </Button>
                                        <Button
                                        title='Agregar Costo'
                                            onClick={() => {
                                                reset();
                                                setIsModalCostOpen(true);
                                                setData(
                                                    'product_id',
                                                    product.id,
                                                );
                                            }}
                                            variant={'success'}
                                        >
                                            <DollarSign size={16} className="mr-1" />
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => router.delete(`/products/${product.id}`, {
                                                preserveScroll: true,
                                            })}
                                            title="Eliminar"
                                            variant={'destructive'}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Stock*/}
            {isModalOpen && (
                <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
                    <div className="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800">
                        <div className="flex items-center justify-between border-b p-6 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Agregar Stock <br />
                                <small className="text-sm leading-none font-medium">Este ajuste suma stock real al inventario disponible para alquiler.</small>
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4 p-6">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Producto
                                </label>
                                <select
                                    value={data.product_id}
                                    onChange={(e) =>
                                        setData('product_id', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-sky-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    required
                                >
                                    <option value="">
                                        Seleccionar producto
                                    </option>
                                    {products.map((product) => (
                                        <option
                                            key={product.id}
                                            value={product.id}
                                        >
                                            {product.name} (Stock:{' '}
                                            {product.current_stock})
                                        </option>
                                    ))}
                                </select>
                                {errors.product_id && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.product_id}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Cantidad
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.qty}
                                    onChange={(e) =>
                                        setData('qty', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-sky-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    placeholder="Ingrese la cantidad"
                                    required
                                />
                                {errors.qty && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.qty}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-sky-600 px-4 py-2 text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isModalCostOpen && (
                <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
                    <div className="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800">
                        <div className="flex items-center justify-between border-b p-6 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Agregar Costo
                            </h2>
                            <button
                                onClick={() => {
                                    reset();
                                    setIsModalCostOpen(false);
                                    reset();
                                }}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmitCost}
                            className="space-y-4 p-6"
                        >
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Precio por día
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.price || ''}
                                    onChange={(e) =>
                                        setData('price', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    placeholder="Ingrese el precio por día"
                                    required
                                />
                                {errors.price && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.price}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalCostOpen(false);
                                        reset();
                                    }}
                                    className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
