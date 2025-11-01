import AppLayout from '@/layouts/app-layout'; // Asumimos que esta ruta es correcta en tu entorno
import { Head, Link } from '@inertiajs/react'; // Asumimos que esta ruta es correcta en tu entorno
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, Plus, DollarSign, List } from 'lucide-react';

// Definiciones de tipos de datos para los movimientos
type StockMovement = {
    id: number;
    qty: number;
    type: number;
    created_at: string;
};

type Cost = {
    id: number;
    price: number;
    created_at: string; // Fecha en que se registró el costo
};

type Product = {
    id: number;
    name: string;
    current_stock: number;
    current_cost: number | null;
    stock_movements: StockMovement[]; // Nota: Inertia convierte la notación snake_case
    costs: Cost[];
};

export default function ShowProduct({ product }: { product: Product }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Productos', href: '/products' },
        { title: product.name, href: `/products/${product.id}` },
    ];

    const formatDate = (dateString: string) => {
        // Formato para mostrar día/mes/año hora:minutos
        return new Date(dateString).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const typeMovementLabels = {
        0: 'ENTRADA POR ORDEN',
        1: 'ALTA DE STOCK',
        2: 'SALIDA POR ORDEN'
    };

    const getTypeMovementLabel = (type: string | number) => {
        return typeMovementLabels[Number(type)] || 'DESCONOCIDO';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detalle: ${product.name}`} />

            <div className="p-6">
                {/* --- Cabecera y Resumen --- */}
                <div className="mb-8 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {product.name}
                        </h1>
                        <Link
                            href={`/products/${product.id}/edit`}
                            className="inline-flex items-center rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white shadow-md transition duration-150 ease-in-out hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                        >
                            <Plus size={16} className="mr-1 rotate-45" /> Editar Producto
                        </Link>
                    </div>
                    <hr className="my-4 border-gray-200 dark:border-gray-700" />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                            <p className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                <List size={18} className="mr-2 text-sky-500" /> Stock Actual
                            </p>
                            <p className="text-3xl font-extrabold text-sky-600 dark:text-sky-400">
                                {product.current_stock ?? 0}
                            </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                            <p className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                Costo por Día
                            </p>
                            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                {product.current_cost !== null ? `$${product.current_cost}` : 'No definido'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- Movimientos de Stock --- */}
                <div className="mb-8">
                    <h2 className="mb-4 flex items-center text-2xl font-semibold text-gray-800 dark:text-gray-200">
                        <List size={20} className="mr-2" /> Historial de Movimientos de Stock
                    </h2>
                    <div className="overflow-x-auto rounded-lg border shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Cantidad
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Fecha
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                {product.stock_movements && product.stock_movements.length > 0 ? (
                                    product.stock_movements
                                        .slice() // Crear una copia para ordenar sin mutar
                                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Ordenar por fecha descendente
                                        .map((movement) => (
                                            <tr key={movement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                                    {movement.id}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                    <span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                                                        {getTypeMovementLabel(movement.type)}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                                    {movement.qty}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                                    {formatDate(movement.created_at)}
                                                </td>
                                            </tr>
                                        ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                                            No hay movimientos de stock registrados para este producto.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- Historial de Costos --- */}
                <div>
                    <h2 className="mb-4 flex items-center text-2xl font-semibold text-gray-800 dark:text-gray-200">
                        <DollarSign size={20} className="mr-2" /> Historial de Costos por Día
                    </h2>
                    <div className="overflow-x-auto rounded-lg border shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Costo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Fecha de Registro
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                {product.costs && product.costs.length > 0 ? (
                                    product.costs
                                        .slice() // Crear una copia para ordenar sin mutar
                                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Ordenar por fecha descendente
                                        .map((cost) => (
                                            <tr key={cost.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                                    {cost.id}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                                    ${cost.price.toFixed(2)}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                                    {formatDate(cost.created_at)}
                                                </td>
                                            </tr>
                                        ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                                            No hay historial de costos registrados para este producto.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- Botón Volver --- */}
                <div className="mt-8">
                    <Link
                        href="/products"
                        className="inline-flex items-center rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition duration-150 ease-in-out hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                        <ArrowLeft size={16} className="mr-2" /> Volver al Listado
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}