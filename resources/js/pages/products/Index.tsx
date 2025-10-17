import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Edit, Eye, Plus, Trash, X } from 'lucide-react';

type Product = {
    id: number | string;
    name: string;
    current_stock: number;
};

export default function ProductsIndex({ products, typeMovement }: { products: Product[]; typeMovement: string[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: '',
        qty: '',
        type: 1,
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

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Productos" />

            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-semibold">Productos</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                        >
                            <Plus size={18} /> Agregar Stock
                        </button>
                        <Link
                            href="/products/create"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition"
                        >
                            <Plus size={18} /> Nuevo Producto
                        </Link>
                    </div>

                </div>

                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Stock Actual</th>
                                <th className="px-6 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td className="px-6 py-3">{product.name}</td>
                                    <td className="px-6 py-3">{product.current_stock}</td>
                                    <td className="px-6 py-3 text-center space-x-2">
                                        <Link
                                            href={`/products/${product.id}`}
                                            title='Ver'
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                            as="button"
                                        >
                                            <Eye size={16} />
                                        </Link>
                                        <Link
                                            href={`/products/${product.id}/edit`}
                                            title='Editar'
                                            className="inline-flex items-center px-4 py-2 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition"
                                        >
                                            <Edit size={16} />
                                        </Link>
                                        <Link
                                            as="button"
                                            method="delete"
                                            href={`/products/${product.id}`}
                                            title='Eliminar'
                                            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
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

                        {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
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

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Producto
                                </label>
                                <select
                                    value={data.product_id}
                                    onChange={(e) => setData('product_id', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    required
                                >
                                    <option value="">Seleccionar producto</option>
                                    {products.map((product) => (
                                        <option key={product.id} value={product.id}>
                                            {product.name} (Stock: {product.current_stock})
                                        </option>
                                    ))}
                                </select>
                                {errors.product_id && (
                                    <p className="text-red-500 text-sm mt-1">{errors.product_id}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tipo de Movimiento
                                </label>
                                <select
                                    value={data.type}
                                    onChange={(e) => setData('type', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                >
                                    {typeMovement.map((type, index) => (
                                        <option key={index} value={index}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Cantidad
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.qty}
                                    onChange={(e) => setData('qty', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Ingrese la cantidad"
                                    required
                                />
                                {errors.qty && (
                                    <p className="text-red-500 text-sm mt-1">{errors.qty}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
