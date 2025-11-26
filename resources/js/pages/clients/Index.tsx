import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Edit3, Eye, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';

type Client = {
    id: number | string;
    name: string;
    cuil?: string | null;
    phone?: string | null;
    email?: string | null;
};

export default function ClientsIndex({ clients }: { clients: Client[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Clientes', href: '/clients' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clientes" />

            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-semibold">Clientes</h1>
                        <Button
                            variant="success"
                            onClick={() => router.visit('/clients/create')}
                        >            
                            <Plus size={18} /> Nuevo Cliente
                        </Button>
                </div>

                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">CUIL</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Email</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {clients.map((client) => (
                                <tr key={client.id}>
                                    <td className="px-6 py-3">{client.name}</td>
                                    <td className="px-6 py-3">{client.cuil ?? '-'}</td>
                                    <td className="px-6 py-3">{client.phone ?? '-'}</td>
                                    <td className="px-6 py-3">{client.email ?? '-'}</td>
                                    <td className="px-6 py-3 space-x-2">
                                        <Button
                                            onClick={() => router.visit(`/clients/${client.id}`)}
                                            variant={'default'}
                                            
                                        >
                                            <Eye size={16} />
                                        </Button>
                                        <Button
                                            onClick={() => router.visit(`/clients/${client.id}/edit`)}
                                            variant={'info'}
                                        >
                                            <Edit3 size={16} />
                                        </Button>
                                        <Button
                                            
                                            onClick={() => router.delete(`/clients/${client.id}`)}
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
