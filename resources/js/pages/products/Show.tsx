import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

type Product = {
    id: number | string;
    name: string;
};

export default function ShowProduct({ product }: { product: Product }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Productos', href: '/products' },
        { title: product.name, href: `/products/${product.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={product.name} />

            <div className="max-w-lg mx-auto p-6">
                <h1 className="text-2xl font-semibold mb-4">{product.name}</h1>

                <div className="mt-6 flex gap-4">
                    <Link
                        href={`/products/${product.id}/edit`}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                    >
                        Editar
                    </Link>
                    <Link
                        href="/products"
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                    >
                        Volver
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
