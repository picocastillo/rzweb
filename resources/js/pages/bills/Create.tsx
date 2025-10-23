import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import React, { useState } from 'react';

interface Client {
    id: number;
    name: string;
    cuil: string;
    phone: string;
}

interface Props {
    clients: Client[];
}

export default function Create({
    clients,
}: Props) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_selectedClient, setSelectedClient] = useState<Client | null>(null);
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Facturas', href: '/bills' },
        { title: 'Nuevo', href: '/clients/create' },
    ];

    const { data, setData, post, errors } = useForm({
        client_id: '',
    });

    const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const clientId = e.target.value;
        const client = clients.find((c) => c.id === parseInt(clientId));

        setData({
            ...data,
            client_id: clientId,
        });

        setSelectedClient(client || null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/bills');
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
                        <h2 className="mb-4 text-lg font-semibold text-gray-600">
                            Selección del Cliente
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

                        </div>
                    </div>

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
                            className="rounded-md bg-green-600 px-6 py-2 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                            Crear Factura
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
