import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

export default function CreateClient() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        cuil: '',
        phone: '',
        email: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Clientes', href: '/clients' },
        { title: 'Nuevo', href: '/clients/create' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/clients');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Cliente" />

            <div className="mx-auto max-w-lg p-6">
                <h1 className="mb-4 text-2xl font-semibold">Agregar Cliente</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Nombre Completo
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full rounded-lg border px-3 py-2"
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            CUIL
                        </label>
                        <input
                            type="text"
                            value={data.cuil}
                            onChange={(e) => setData('cuil', e.target.value)}
                            className="w-full rounded-lg border px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Teléfono
                        </label>
                        <input
                            type="text"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            className="w-full rounded-lg border px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Email
                        </label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full rounded-lg border px-3 py-2"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-sky-600 px-4 py-2 text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Guardar
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
