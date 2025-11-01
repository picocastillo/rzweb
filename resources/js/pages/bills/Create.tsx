import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { ItemOrder, Order, Client } from '@/types';

interface Props {
    clients: Client[];
    orders: Order[];
    items: ItemOrder[];
    selectedClientId?: number | string;
}

export default function Create({
    clients,
    orders,
    items,
    selectedClientId,
}: Props) {
const { data, setData, post } = useForm({
    client_id: selectedClientId ?? '',
});
const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);

    // Sincronizamos el estado del formulario cuando cambien los props
    useEffect(() => {
        setData((prev) => ({
            ...prev,
            client_id: selectedClientId ?? '',
        }));
    }, [selectedClientId, setData]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Facturas', href: '/bills' },
        { title: 'Nuevo', href: '/bills/create' },
    ];

    const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const clientId = e.target.value;
        setData((prev) => ({ ...prev, client_id: clientId, setSelectedOrderIds: [] }));
        router.visit(`/bills/create?client_id=${clientId}`, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleOrderToggle = (orderId: number) => {
        setSelectedOrderIds(prev => 
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
    };
    const handleSelectAllOrders = () => {
        setSelectedOrderIds(clientOrders.map((order) => order.id));
    };

    const handleDeselectAllOrders = () => {
        setSelectedOrderIds([]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/bills');
    };

    // Filtramos ordenes por cliente seleccionado
    const clientOrders = data.client_id
        ? orders.filter(
              (order) =>
                  order.client_id.toString() === data.client_id.toString(),
          )
        : [];

    // Obtenemos todos los items de las órdenes seleccionadas
    const selectedOrdersItems = selectedOrderIds.length > 0
        ? items.filter(item => selectedOrderIds.includes(item.order_id))
        : [];

    // Obtenemos dias de los productos en alquiler
    const calculateDaysInRental = (itemId: number): number => {
        const item = items.find(i => i.id === itemId);
        if (!item) return 0;

        const order = orders.find(o => o.id === item.order_id);
        if (!order) return 0;

        const dateFrom = new Date(order.date_from);
        const dateTo = new Date(order.date_to);
        const diffTime = Math.abs(dateTo.getTime() - dateFrom.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    }

    const subTotal = (item: ItemOrder): number => {
        const days = calculateDaysInRental(item.id);
        return (item.current_cost ?? 0) * item.quantity * days;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva Factura" />
            <div className="mx-auto max-w-7xl px-4 py-6">
                <h1 className="mb-6 text-3xl font-bold text-blue-500">
                    Nueva Factura
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* CLIENTE */}
                    <div className="rounded-lg bg-gray-50 p-6 shadow dark:bg-gray-900">
                        <h2 className="mb-4 text-lg font-semibold">Cliente</h2>
                        <select
                            value={data.client_id}
                            onChange={handleClientChange}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-sky-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            required
                        >
                            <option value="">Seleccionar cliente</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* LISTA DE ÓRDENES */}
                    {data.client_id && clientOrders.length > 0 && (
                        <div className="rounded-lg bg-gray-50 p-6 shadow dark:bg-gray-900">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold">
                                    Órdenes del Cliente
                                </h2>
                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        onClick={handleSelectAllOrders}
                                        className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                                    >
                                        Seleccionar Todas
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDeselectAllOrders}
                                        className="rounded bg-gray-500 px-3 py-1 text-sm text-white hover:bg-gray-600"
                                    >
                                        Deseleccionar Todas
                                    </button>
                                </div>
                            </div>

                            <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                                {selectedOrderIds.length} de {clientOrders.length}{' '}
                                órdenes seleccionadas
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {clientOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className={`cursor-pointer rounded-lg border p-4 transition-all ${
                                            selectedOrderIds.includes(order.id)
                                                ? 'border-green-500 bg-green-50 ring-2 ring-green-500 dark:bg-green-900/20'
                                                : 'border-gray-300 hover:border-green-300 dark:border-gray-600 dark:hover:border-green-700'
                                        }`}
                                        onClick={() =>
                                            handleOrderToggle(order.id)
                                        }
                                    >
                                        <div className="mb-2 flex items-start justify-between">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {order.code}
                                            </h3>
                                            <div className="flex items-center space-x-2">
                                                {selectedOrderIds.includes(
                                                    order.id,
                                                ) && (
                                                    <span className="rounded-full bg-green-500 px-2 py-1 text-xs text-white">
                                                        Seleccionada
                                                    </span>
                                                )}
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOrderIds.includes(
                                                        order.id,
                                                    )}
                                                    onChange={() =>
                                                        handleOrderToggle(
                                                            order.id,
                                                        )
                                                    }
                                                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                            <p>
                                                <span className="font-medium">
                                                    Estado:
                                                </span>{' '}
                                                {order.last_state}
                                            </p>
                                            <p>
                                                <span className="font-medium">
                                                    Dirección:
                                                </span>{' '}
                                                {order.address}
                                            </p>
                                            <p>
                                                <span className="font-medium">
                                                    Desde:
                                                </span>{' '}
                                                {order.date_from}
                                            </p>
                                            <p>
                                                <span className="font-medium">
                                                    Hasta:
                                                </span>{' '}
                                                {order.date_to}
                                            </p>
                                            <p>
                                                <span className="font-medium">
                                                    Estado:
                                                </span>{' '}
                                                {order.is_active ? 'Activa' : 'Inactiva'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {data.client_id && clientOrders.length === 0 && (
                        <div className="rounded-lg bg-gray-50 p-6 shadow dark:bg-gray-900">
                            <h2 className="mb-4 text-lg font-semibold">
                                Órdenes del Cliente
                            </h2>
                            <p className="py-4 text-center text-gray-500 dark:text-gray-400">
                                No se encontraron órdenes para este cliente.
                            </p>
                        </div>
                    )}

                    {/* PRODUCTOS */}
                    {selectedOrdersItems.length > 0 && (
                        <div className="rounded-lg bg-gray-50 p-6 shadow dark:bg-gray-900">
                            <h2 className="mb-4 text-lg font-semibold">
                                Productos de las Órdenes Seleccionadas (
                                {selectedOrderIds.length} órdenes)
                            </h2>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 text-left text-sm font-semibold">
                                            Producto
                                        </th>
                                        <th className="px-4 py-2 text-center text-sm font-semibold">
                                            Pendiente
                                        </th>
                                        <th className="px-4 py-2 text-center text-sm font-semibold">
                                            Dias en Alquiler
                                        </th>
                                        <th className="px-4 py-2 text-center text-sm font-semibold">
                                            Subtotal
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrdersItems.map((item) => (
                                        <tr key={item.id} className="border-t">
                                            <td className="px-4 py-2">
                                                {item.product_name}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                {item.quantity}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                {calculateDaysInRental(item.id)}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                {subTotal(item).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* BOTONES */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => router.visit('/bills')}
                            className="rounded-md border border-gray-300 px-6 py-2 text-gray-700"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={
                                !data.client_id || selectedOrderIds.length === 0
                            }
                            className="rounded-md bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:bg-gray-400"
                        >
                            Crear Factura ({selectedOrderIds.length} órdenes)
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
