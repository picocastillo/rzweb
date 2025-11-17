import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { type BreadcrumbItem, Client } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function EditClient({ client }: { client: Client }) {
    const { data, setData, put, processing, errors } = useForm({
        name: client.name || '',
        cuil: client.cuil || '',
        phone: client.phone || '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Clientes', href: '/clients' },
        { title: client.name, href: `/clients/${client.id}/edit` },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/clients/${client.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}> 
            <Head title={`Editar ${client.name}`} />

            <div className="max-w-lg mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Editar Cliente</CardTitle>
                        <CardDescription>
                            Actualiza la información del cliente {client.name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nombre</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                />
                                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">CUIL</label>
                                <input
                                    type="text"
                                    value={data.cuil}
                                    onChange={(e) => setData('cuil', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                />
                                {errors.cuil && <p className="text-red-600 text-sm mt-1">{errors.cuil}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Teléfono</label>
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                />
                                {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                            >
                                {processing ? 'Actualizando...' : 'Actualizar'}
                            </button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}