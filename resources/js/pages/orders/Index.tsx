import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Edit3, Eye, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Order = {
    name_last_state: string;
    name_client: string;
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

export default function OrdersIndex({ orders }: { orders: Order[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Ordenes', href: '/orders' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ordenes" />

            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-semibold">Ordenes</h1>
                    <Button
                        variant="success"
                        onClick={() => router.visit('/orders/create')}
                    >          
                        <Plus size={18} /> Nueva Orden
                    </Button>
                </div>

                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">#</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Direccion</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Codigo</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Cliente</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td className="px-6 py-3">{order.id}</td>
                                    <td className="px-6 py-3">{order.address ?? '-'}</td>
                                    <td className="px-6 py-3">{order.code ?? '-'}</td>
                                    <td className="px-6 py-3">{order.name_client ?? '-'}</td>
                                    <td className="px-6 py-3">{order.name_last_state ?? '-'}</td>
                                    <td className="px-6 py-3 space-x-2">
                                        <Button
                                            onClick={() => router.visit(`/orders/${order.id}`)}
                                            variant={'default'}
                                            
                                        >
                                            <Eye size={16} />
                                        </Button>
                                        <Button
                                            onClick={() => router.visit(`/orders/${order.id}/edit`)}
                                            variant={'info'}
                                        >
                                            <Edit3 size={16} />
                                        </Button>
                                        <Button
                                            
                                            onClick={() => router.delete(`/orders/${order.id}`)}
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
