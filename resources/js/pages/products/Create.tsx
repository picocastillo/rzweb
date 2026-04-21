import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

export default function CreateProduct() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Productos', href: '/products' },
        { title: 'Nuevo', href: '/products/create' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/products');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Producto" />

            <div className="mx-auto max-w-lg p-6">
                <h1 className="mb-4 text-2xl font-semibold">
                    Agregar Producto
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Nombre
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
