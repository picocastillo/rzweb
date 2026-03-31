import AppLayout from '@/layouts/app-layout';
import { Client, ItemOrder, Order, type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

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
        orders: [] as number[], // Agregamos el array de órdenes seleccionadas
    });
    const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);

    // Sincronizamos el estado del formulario cuando cambien los props
    useEffect(() => {
        setData((prev) => ({
            ...prev,
            client_id: selectedClientId ?? '',
        }));
    }, [selectedClientId, setData]);

    // Sincronizamos las órdenes seleccionadas con el formulario
    useEffect(() => {
        setData((prev) => ({
            ...prev,
            orders: selectedOrderIds,
        }));
    }, [selectedOrderIds, setData]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Facturas', href: '/bills' },
        { title: 'Nuevo', href: '/bills/create' },
    ];

    const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const clientId = e.target.value;
        setData((prev) => ({ ...prev, client_id: clientId, orders: [] }));
        setSelectedOrderIds([]); // Limpiamos las órdenes seleccionadas
        router.visit(`/bills/create?client_id=${clientId}`, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleOrderToggle = (orderId: number) => {
        setSelectedOrderIds((prev) =>
            prev.includes(orderId)
                ? prev.filter((id) => id !== orderId)
                : [...prev, orderId],
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

    // Ítems de todas las órdenes del cliente (tabla única con selección por orden)
    const clientOrderItems = data.client_id
        ? items.filter((item) =>
              clientOrders.some((o) => o.id === item.order_id),
          )
        : [];

    const orderForItem = (item: ItemOrder): Order | undefined =>
        orders.find((o) => o.id === item.order_id);

    // Días: misma regla que facturación (salida tipo 2 → regreso tipo 0, o hasta hoy)
    const calculateDaysInRental = (itemId: number): number => {
        const item = items.find((i) => i.id === itemId);
        if (!item) return 0;
        if (item.rental_days != null) return item.rental_days;

        return 0;
    };

    const subTotal = (item: ItemOrder): number => {
        const days = calculateDaysInRental(item.id);
        return (item.current_cost ?? 0) * item.quantity * days;
    };

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
                                {selectedOrderIds.length} de{' '}
                                {clientOrders.length} órdenes seleccionadas
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-100 dark:bg-gray-800">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="w-12 px-3 py-3 text-left text-xs font-semibold tracking-wide text-gray-700 uppercase dark:text-gray-300"
                                            >
                                                <span className="sr-only">
                                                    Incluir orden
                                                </span>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-3 py-3 text-left text-xs font-semibold tracking-wide text-gray-700 uppercase dark:text-gray-300"
                                            >
                                                Producto
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-3 py-3 text-right text-xs font-semibold tracking-wide text-gray-700 uppercase dark:text-gray-300"
                                            >
                                                Cantidad
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-3 py-3 text-right text-xs font-semibold tracking-wide text-gray-700 uppercase dark:text-gray-300"
                                            >
                                                Costo
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-3 py-3 text-right text-xs font-semibold tracking-wide text-gray-700 uppercase dark:text-gray-300"
                                            >
                                                Días
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-3 py-3 text-left text-xs font-semibold tracking-wide text-gray-700 uppercase dark:text-gray-300"
                                            >
                                                Dirección
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-3 py-3 text-right text-xs font-semibold tracking-wide text-gray-700 uppercase dark:text-gray-300"
                                            >
                                                Subtotal
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                                        {clientOrderItems.map((item) => {
                                            const order = orderForItem(item);
                                            const isSelected =
                                                selectedOrderIds.includes(
                                                    item.order_id,
                                                );
                                            return (
                                                <tr
                                                    key={item.id}
                                                    className={
                                                        isSelected
                                                            ? 'bg-green-50 dark:bg-green-900/20'
                                                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                                    }
                                                >
                                                    <td className="px-3 py-3 whitespace-nowrap">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() =>
                                                                handleOrderToggle(
                                                                    item.order_id,
                                                                )
                                                            }
                                                            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 dark:border-gray-600"
                                                            aria-label={`Incluir orden ${order?.code ?? item.order_id}`}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-3 text-sm text-gray-900 dark:text-white">
                                                        {item.product_name}
                                                    </td>
                                                    <td className="px-3 py-3 text-right text-sm whitespace-nowrap text-gray-700 dark:text-gray-300">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="px-3 py-3 text-right text-sm whitespace-nowrap text-gray-700 dark:text-gray-300">
                                                        {(
                                                            item.current_cost ??
                                                            0
                                                        ).toFixed(2)}
                                                    </td>
                                                    <td className="px-3 py-3 text-right text-sm whitespace-nowrap text-gray-700 dark:text-gray-300">
                                                        {item.rental_days !=
                                                        null
                                                            ? calculateDaysInRental(
                                                                  item.id,
                                                              )
                                                            : '—'}
                                                    </td>
                                                    <td className="max-w-xs px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                        {order?.address ?? '—'}
                                                    </td>
                                                    <td className="px-3 py-3 text-right text-sm font-medium whitespace-nowrap text-gray-900 dark:text-white">
                                                        {item.rental_days !=
                                                        null
                                                            ? subTotal(
                                                                  item,
                                                              ).toFixed(2)
                                                            : '—'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            {clientOrderItems.length === 0 && (
                                <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No hay productos en las órdenes de este
                                    cliente.
                                </p>
                            )}
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
                            Crear Factura
                            {/* ({selectedOrderIds.length} órdenes) */}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
