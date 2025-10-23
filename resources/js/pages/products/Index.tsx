import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { DollarSign, Edit, Eye, Plus, Trash, X } from 'lucide-react';
import React, { useState } from 'react';

type Product = {
    id: number;
    name: string;
    current_stock: number | null;
    current_cost: number | null;
};

export default function ProductsIndex({
    products,
    typeMovement,
}: {
    products: Product[];
    typeMovement: string[];
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalCostOpen, setIsModalCostOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<{
        product_id: number | string;
        qty: string;
        type: number;
        price: string;
    }>({
        product_id: '',
        qty: '',
        type: 1,
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
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
                        >
                            <Plus size={18} /> Agregar Stock
                        </button>
                        <Link
                            href="/products/create"
                            className="inline-flex items-center gap-2 rounded bg-sky-600 px-4 py-2 text-white transition hover:bg-sky-700"
                        >
                            <Plus size={18} /> Nuevo Producto
                        </Link>
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
                                        <Link
                                            href={`/products/${product.id}`}
                                            title="Ver"
                                            className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                                            as="button"
                                        >
                                            <Eye size={16} />
                                        </Link>
                                        <Link
                                            href={`/products/${product.id}/edit`}
                                            title="Editar"
                                            className="inline-flex items-center rounded bg-yellow-400 px-4 py-2 text-white transition hover:bg-yellow-500"
                                        >
                                            <Edit size={16} />
                                        </Link>
                                        <button
                                        title='Agregar Costo'
                                            onClick={() => {
                                                reset();
                                                setIsModalCostOpen(true);
                                                setData(
                                                    'product_id',
                                                    product.id,
                                                );
                                            }}
                                            className="inline-flex items-center rounded bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-700"
                                        >
                                            <DollarSign size={16} className="mr-1" />
                                        </button>
                                        <Link
                                            as="button"
                                            method="delete"
                                            href={`/products/${product.id}`}
                                            title="Eliminar"
                                            className="inline-flex items-center rounded bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
                                        >
                                            <Trash size={16} />
                                        </Link>
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
                                Agregar Stock
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
                                    Tipo de Movimiento
                                </label>
                                <select
                                    value={data.type}
                                    onChange={(e) =>
                                        setData(
                                            'type',
                                            parseInt(e.target.value),
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-sky-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                >
                                    {typeMovement.map((type, index) => (
                                        <option key={index} value={index}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
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
