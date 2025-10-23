import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Plus } from 'lucide-react';

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
                    <Link
                        href="/clients/create"
                        className="inline-flex items-center px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition"
                    >            
                        <Plus size={18} /> Nuevo Cliente
                    </Link>
                </div>

                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">CUIL</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Email</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {clients.map((client) => (
                                <tr key={client.id}>
                                    <td className="px-6 py-3">{client.name}</td>
                                    <td className="px-6 py-3">{client.cuil ?? '-'}</td>
                                    <td className="px-6 py-3">{client.phone ?? '-'}</td>
                                    <td className="px-6 py-3">{client.email ?? '-'}</td>
                                    <td className="px-6 py-3 text-right space-x-2">
                                        <Link
                                            href={`/clients/${client.id}`}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                            as="button"
                                        >
                                            Ver
                                        </Link>
                                        <Link
                                            href={`/clients/${client.id}/edit`}
                                            className="inline-flex items-center px-4 py-2 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition"
                                        >
                                            Editar
                                        </Link>
                                        <Link
                                            as="button"
                                            method="delete"
                                            href={`/clients/${client.id}`}
                                            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                        >
                                            Eliminar
                                        </Link>
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
