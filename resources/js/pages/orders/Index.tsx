import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { getStatusVariant } from '@/utils/order-utils';
import { Head, router } from '@inertiajs/react';
import { Eye, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type Order = {
    name_last_state: string;
    name_client: string;
    name_assigned_to: string | null;
    id: number;
    user_id: number;
    client_id: number;
    last_state: number;
    address: string;
    code: string;
    date_from: Date | null;
    date_to: Date | null;
    is_active: boolean;
};

export default function OrdersIndex({
    orders,
    filters,
}: {
    orders: Order[];
    filters: { search?: string };
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Ordenes', href: '/orders' },
    ];

    const [search, setSearch] = useState(filters.search ?? '');

    // Debounce: espera 400ms antes de navegar
    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                '/orders',
                { search },
                { preserveState: true, replace: true },
            );
        }, 400);

        return () => clearTimeout(timeout);
    }, [search]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ordenes" />

            <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Ordenes</h1>

                    <Button
                        variant="success"
                        onClick={() => router.visit('/orders/create')}
                    >
                        <Plus size={18} /> Nueva Orden
                    </Button>
                </div>

                {/* Buscador — ancho completo, margen inferior antes de la tabla */}
                <div className="relative mb-4 w-full">
                    <Search
                        size={16}
                        className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Buscar por dirección..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-md border py-2 pr-10 pl-9 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto rounded-lg border">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                    #
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Direccion
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Codigo
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Cliente
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Trabajador
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td className="px-6 py-3">{order.id}</td>
                                    <td className="px-6 py-3">
                                        {order.address ?? '-'}
                                    </td>
                                    <td className="px-6 py-3">
                                        {order.code ?? '-'}
                                    </td>
                                    <td className="px-6 py-3">
                                        {order.name_client ?? '-'}
                                    </td>
                                    <td className="px-6 py-3">
                                        {' '}
                                        <Badge
                                            variant={getStatusVariant(
                                                order.name_last_state,
                                            )}
                                        >
                                            {order.name_last_state}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">
                                        {order.name_assigned_to ?? '—'}
                                    </td>
                                    <td className="space-x-2 px-6 py-3">
                                        <Button
                                            onClick={() =>
                                                router.visit(
                                                    `/orders/${order.id}`,
                                                )
                                            }
                                            variant={'default'}
                                        >
                                            <Eye size={16} />
                                        </Button>
                                        {/* <Button
                                            onClick={() =>
                                                router.visit(
                                                    `/orders/${order.id}/edit`,
                                                )
                                            }
                                            variant={'info'}
                                        >
                                            <Edit3 size={16} />
                                        </Button> */}
                                        <Button
                                            onClick={() =>
                                                router.delete(
                                                    `/orders/${order.id}`,
                                                )
                                            }
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
        </AppLayout>
    );
}
