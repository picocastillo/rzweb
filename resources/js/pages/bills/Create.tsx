import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useState } from 'react';

interface Client {
    id: number;
    name: string;
    cuil: string;
    phone: string;
}

interface BillableItem {
    order_id: number;
    order_code: string;
    product_id: number;
    product_name: string;
    qty: number;
    price: number;
    subtotal: number;
    address: string;
    date_from: string;
    date_to: string;
}

interface Props {
    clients: Client[];
    defaultDateFrom: string;
    defaultDateTo: string;
}

export default function Create({
    clients,
    defaultDateFrom,
    defaultDateTo,
}: Props) {
    const [billableItems, setBillableItems] = useState<BillableItem[]>([]);
    const [loading, setLoading] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_selectedClient, setSelectedClient] = useState<Client | null>(null);
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Facturas', href: '/bills' },
        { title: 'Nuevo', href: '/clients/create' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        client_id: '',
        date_from: defaultDateFrom,
        date_to: defaultDateTo,
        amount: 0,
        name: '',
        cuil: '',
        phone: '',
        order_ids: [] as number[],
    });

    const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const clientId = e.target.value;
        const client = clients.find((c) => c.id === parseInt(clientId));

        setData({
            ...data,
            client_id: clientId,
            name: client?.name || '',
            cuil: client?.cuil || '',
            phone: client?.phone || '',
        });

        setSelectedClient(client || null);
        setBillableItems([]);
    };

    const fetchBillableItems = async () => {
        if (!data.client_id || !data.date_from || !data.date_to) return;

        setLoading(true);
        try {
            const response = await fetch('/bills/get-billable-items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    client_id: data.client_id,
                    date_from: data.date_from,
                    date_to: data.date_to,
                }),
            });

            const result = await response.json();
            setBillableItems(result.items);
            setData('amount', result.total_amount);

            const orderIds = [
                ...new Set(
                    result.items.map((item: BillableItem) => item.order_id),
                ),
            ];
            setData('order_ids', orderIds as number[]);
        } catch (error) {
            console.error('Error fetching billable items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/bills');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('es-AR');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Reporte" />
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-blue-500">
                        Nueva Factura
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Genera facturas mensuales para tus clientes
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Sección de Cliente y Fechas */}
                    <div className="rounded-lg bg-gray-50 p-6 shadow dark:bg-gray-900">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">
                            Información del Cliente y Período
                        </h2>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Cliente
                                </label>
                                <select
                                    value={data.client_id}
                                    onChange={handleClientChange}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Nombre Factura
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    required
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Fecha Desde
                                </label>
                                <input
                                    type="date"
                                    value={data.date_from}
                                    onChange={(e) =>
                                        setData('date_from', e.target.value)
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    required
                                />
                                {errors.date_from && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.date_from}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Fecha Hasta
                                </label>
                                <input
                                    type="date"
                                    value={data.date_to}
                                    onChange={(e) =>
                                        setData('date_to', e.target.value)
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    required
                                />
                                {errors.date_to && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.date_to}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    CUIL/CUIT
                                </label>
                                <input
                                    type="text"
                                    value={data.cuil}
                                    onChange={(e) =>
                                        setData('cuil', e.target.value)
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    required
                                />
                                {errors.cuil && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.cuil}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData('phone', e.target.value)
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                                {errors.phone && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={fetchBillableItems}
                                disabled={loading || !data.client_id}
                                className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                            >
                                {loading
                                    ? 'Cargando...'
                                    : 'Cargar Items Facturables'}
                            </button>
                        </div>
                    </div>

                    {/* Sección de Items Facturables */}
                    {billableItems.length > 0 && (
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">
                                Items a Facturar
                            </h2>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Orden
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Producto
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Dirección
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Período
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Cantidad
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Precio Unit.
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Subtotal
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {billableItems.map((item, index) => (
                                            <tr
                                                key={index}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {item.order_code}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {item.product_name}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {item.address}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {formatDate(item.date_from)}{' '}
                                                    - {formatDate(item.date_to)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-gray-900">
                                                    {item.qty}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-gray-900">
                                                    {formatCurrency(item.price)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                                    {formatCurrency(
                                                        item.subtotal,
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-3 text-right text-sm font-semibold text-gray-900"
                                            >
                                                Total:
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                                                {formatCurrency(data.amount)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Botones de Acción */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => router.visit('/bills')}
                            className="rounded-md border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={processing || billableItems.length === 0}
                            className="rounded-md bg-green-600 px-6 py-2 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                            {processing ? 'Guardando...' : 'Crear Factura'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
