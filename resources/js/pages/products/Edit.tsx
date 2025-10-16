import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

type Product = {
    id: number | string;
    name: string;
};

export default function EditProduct({ product }: { product: Product }) {
    const { data, setData, put, processing, errors } = useForm({
        name: product.name || '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Productos', href: '/products' },
        { title: product.name, href: `/products/${product.id}/edit` },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/products/${product.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar ${product.name}`} />

            <div className="max-w-lg mx-auto p-6">
                <h1 className="text-2xl font-semibold mb-4">Editar Producto</h1>
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

                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                    >
                        Actualizar
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
