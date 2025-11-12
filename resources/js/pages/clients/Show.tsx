import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

type Client = {
    id: number | string;
    name: string;
    cuil?: string | null;
    phone?: string | null;
};

export default function ShowClient({ client }: { client: Client }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Clientes', href: '/clients' },
        { title: client.name, href: `/clients/${client.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={client.name} />

            <div className="max-w-lg mx-auto p-6">
                <h1 className="text-2xl font-semibold mb-4">{client.name}</h1>

                <div className="space-y-3">
                    <p><strong>CUIL:</strong> {client.cuil ?? '-'}</p>
                    <p><strong>Teléfono:</strong> {client.phone ?? '-'}</p>
                </div>

                <div className="mt-6 flex gap-4">
                    <Link
                        href={`/clients/${client.id}/edit`}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                    >
                        Editar
                    </Link>
                    <Link
                        href="/clients"
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                    >
                        Volver
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
