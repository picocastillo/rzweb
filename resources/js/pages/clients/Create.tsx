import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

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

            <div className="max-w-lg mx-auto p-6">
                <h1 className="text-2xl font-semibold mb-4">Agregar Cliente</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nombre</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full rounded-lg border px-3 py-2"
                        />
                        {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">CUIL</label>
                        <input
                            type="text"
                            value={data.cuil}
                            onChange={(e) => setData('cuil', e.target.value)}
                            className="w-full rounded-lg border px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Teléfono</label>
                        <input
                            type="text"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            className="w-full rounded-lg border px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
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
                        className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Guardar
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
