import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import React, { useState } from 'react';

type Client = {
    id: number;
    name: string;
};

type Product = {
    id: number;
    name: string;
    current_stock: number;
};

type Worker = {
    id: number;
    name: string;
};

/** Matches app/helper.php STATES — order lifecycle labels */
const ORDER_STATE_LABELS = [
    'Iniciada',
    'Asignada',
    'En curso',
    'Finalizada',
] as const;

export default function CreateOrder({
    clients,
    products,
    workers,
}: {
    clients: Client[];
    products: Product[];
    workers: Worker[];
}) {
    const [currentProduct, setCurrentProduct] = useState('');
    const [currentQty, setCurrentQty] = useState(1);

    const { data, setData, post, processing, errors } = useForm({
        client_id: '',
        address: '',
        code: '',
        date_from: '',
        date_to: '',
        is_active: true,
        assigned_to: '' as string | number,
        items: [] as { product_id: string; qty: number }[],
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Órdenes', href: '/orders' },
        { title: 'Nuevo', href: '/orders/create' },
    ];

    const addItem = () => {
        if (!currentProduct || currentQty <= 0) return;

        const existingItemIndex = data.items.findIndex(
            (item) => item.product_id === currentProduct,
        );

        if (existingItemIndex !== -1) {
            // Si ya existe, sumamos la cantidad
            const updatedItems = data.items.map((item, index) =>
                index === existingItemIndex
                    ? { ...item, qty: item.qty + currentQty }
                    : item,
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
        setData(
            'items',
            data.items.filter((_, i) => i !== index),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/orders', { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva Orden" />
            <div className="mx-auto max-w-6xl p-6">
                <h1 className="mb-6 text-2xl font-semibold">Agregar Orden</h1>

                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-6 lg:flex-row">
                        {/* Columna izquierda - Datos del formulario */}
                        <div className="space-y-4 lg:basis-1/2">
                            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                                <h2 className="mb-4 text-lg font-medium">
                                    Información de la Orden
                                </h2>

                                {/* Cliente */}
                                <div className="mb-4">
                                    <label className="mb-2 block text-sm font-medium">
                                        Cliente
                                    </label>
                                    <select
                                        value={data.client_id}
                                        onChange={(e) =>
                                            setData('client_id', e.target.value)
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-sky-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        required
                                    >
                                        <option value="">
                                            Seleccionar cliente
                                        </option>
                                        {clients.map((client) => (
                                            <option
                                                key={client.id}
                                                value={client.id}
                                            >
                                                {client.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.client_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.client_id}
                                        </p>
                                    )}
                                </div>

                                {/* Dirección */}
                                <div className="mb-4">
                                    <label className="mb-2 block text-sm font-medium">
                                        Dirección
                                    </label>
                                    <input
                                        type="text"
                                        value={data.address}
                                        onChange={(e) =>
                                            setData('address', e.target.value)
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        required
                                    />
                                    {errors.address && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.address}
                                        </p>
                                    )}
                                </div>

                                {/* Código */}
                                <div className="mb-4">
                                    <label className="mb-2 block text-sm font-medium">
                                        Código(Opcional)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.code}
                                        onChange={(e) =>
                                            setData('code', e.target.value)
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                    {errors.code && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.code}
                                        </p>
                                    )}
                                </div>

                                {/* Trabajador (opcional) */}
                                <div className="mb-4">
                                    <label className="mb-2 block text-sm font-medium">
                                        Asignar a trabajador (opcional)
                                    </label>
                                    <select
                                        value={
                                            data.assigned_to === ''
                                                ? ''
                                                : String(data.assigned_to)
                                        }
                                        onChange={(e) =>
                                            setData(
                                                'assigned_to',
                                                e.target.value === ''
                                                    ? ''
                                                    : Number(e.target.value),
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-sky-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Sin asignar</option>
                                        {workers.map((w) => (
                                            <option key={w.id} value={w.id}>
                                                {w.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.assigned_to && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.assigned_to}
                                        </p>
                                    )}
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        Estados:{' '}
                                        {ORDER_STATE_LABELS.join(' → ')}. Si
                                        asignas un trabajador, la orden queda en
                                        «{ORDER_STATE_LABELS[1]}».
                                    </p>
                                </div>

                                {/* Fechas */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {/* Fecha inicio */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            Fecha inicio(Opcional)
                                        </label>
                                        <input
                                            type="date"
                                            value={data.date_from}
                                            onChange={(e) =>
                                                setData(
                                                    'date_from',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        />
                                        {errors.date_from && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.date_from}
                                            </p>
                                        )}
                                    </div>

                                    {/* Fecha fin */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            Fecha fin(Opcional)
                                        </label>
                                        <input
                                            type="date"
                                            value={data.date_to}
                                            onChange={(e) =>
                                                setData(
                                                    'date_to',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        />
                                        {errors.date_to && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.date_to}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Columna derecha - Carrito */}
                        <div className="lg:basis-1/2">
                            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                                <h2 className="mb-4 text-lg font-medium">
                                    Productos
                                </h2>

                                {/* Selector de productos */}
                                <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                                    <select
                                        value={currentProduct}
                                        onChange={(e) =>
                                            setCurrentProduct(e.target.value)
                                        }
                                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-sky-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">
                                            Seleccionar producto
                                        </option>
                                        {products.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} (Stock:{' '}
                                                {p.current_stock})
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        min={1}
                                        value={currentQty}
                                        onChange={(e) =>
                                            setCurrentQty(
                                                Number(e.target.value),
                                            )
                                        }
                                        className="w-20 rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                    <Button
                                        type="button"
                                        onClick={addItem}
                                        variant={'success'}
                                        className="whitespace-nowrap"
                                    >
                                        Agregar
                                    </Button>
                                </div>

                                {/* Lista de productos agregados */}
                                {data.items.length > 0 ? (
                                    <div className="overflow-hidden rounded-lg border">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="p-3 text-left font-medium">
                                                        Producto
                                                    </th>
                                                    <th className="p-3 text-left font-medium">
                                                        Cantidad
                                                    </th>
                                                    <th className="w-16"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.items.map(
                                                    (item, index) => {
                                                        const product =
                                                            products.find(
                                                                (p) =>
                                                                    p.id ===
                                                                    Number(
                                                                        item.product_id,
                                                                    ),
                                                            );
                                                        return (
                                                            <tr
                                                                key={index}
                                                                className="border-t border-gray-200 dark:border-gray-600"
                                                            >
                                                                <td className="p-3">
                                                                    {product?.name ??
                                                                        '-'}
                                                                </td>
                                                                <td className="p-3">
                                                                    {item.qty}
                                                                </td>
                                                                <td className="p-3">
                                                                    <Button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            removeItem(
                                                                                index,
                                                                            )
                                                                        }
                                                                        variant={
                                                                            'destructive'
                                                                        }
                                                                        size="sm"
                                                                    >
                                                                        <Trash2
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    },
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                                        <p>No hay productos agregados</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Botón de guardar */}
                    <div className="mt-6">
                        <Button
                            disabled={processing}
                            variant={'success'}
                            size="lg"
                        >
                            {processing ? 'Guardando...' : 'Guardar Orden'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
