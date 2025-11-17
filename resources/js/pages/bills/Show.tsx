import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, FileText, Package, User } from 'lucide-react';

interface Cost {
    id: number;
    product_id: number;
    price: number;
    created_at: string;
}

interface Client {
    id: number;
    name: string;
    cuil: string;
    phone?: string;
}

interface Product {
    id: number;
    name: string;
    current_cost: number;
    costs?: Cost[];
}

interface StockMovement {
    id: number;
    product_id: number;
    type: string;
    qty: number;
    created_at: string;
    product?: Product;
}

interface BillItem {
    id: number;
    bill_id: number;
    days: number;
    stock_movement_id: number;
    stock_movement?: StockMovement;
}

interface Bill {
    id: number;
    client_id: number;
    date_from: string;
    amount: number;
    created_at: string;
    client?: Client;
    bill_items?: BillItem[];
}

interface Props {
    bill: Bill;
}

export default function ShowBill({ bill }: Props) {
    if (!bill) {
        return (
            <AppLayout>
                <Head title="Factura no encontrada" />
                <div className="p-6">
                    <div className="rounded-lg bg-red-50 p-8 text-center">
                        <h1 className="text-2xl font-bold text-red-800">
                            Factura no encontrada
                        </h1>
                        <Link
                            href="/bills"
                            className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Volver a facturas
                        </Link>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Facturas', href: '/bills' },
        { title: `Factura #${bill.id}`, href: `/bills/${bill.id}` },
    ];

    const billItems = bill.bill_items || [];

    // Formatear fecha con validación
    const formatDate = (date?: string) => {
        if (!date) return 'N/A';

        try {
            return new Date(date).toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch (error) {
            return 'Fecha inválida' + error;
        }
    };

    // Formatear moneda con validación
    const formatCurrency = (amount?: number) => {
        if (amount === undefined || amount === null) return '$0.00';

        return amount.toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Factura #${bill.id}`} />
            <div className="p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="mt-3 flex items-center">
                        <div className="flex items-center gap-4">
                            <div>
                                <FileText className="h-8 w-8 text-blue-600" />
                                <p className="mt-2 text-sm text-gray-600">
                                    Detalles completos de la factura #{bill.id}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Información Principal */}
                    <div className="space-y-6 lg:col-span-2">
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            {/* Información del Cliente */}
                            <div className="mb-4 flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Información del Cliente
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                        Nombre
                                    </label>
                                    <p className="mt-1 text-lg font-medium text-gray-900">
                                        {bill.client?.name || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                        CUIL
                                    </label>
                                    <p className="mt-1 text-lg font-medium text-gray-900">
                                        {bill.client?.cuil || 'N/A'}
                                    </p>
                                </div>
                                {bill.client?.phone && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-500">
                                            Teléfono
                                        </label>
                                        <p className="mt-1 text-lg font-medium text-gray-900">
                                            {bill.client.phone}
                                        </p>
                                    </div>
                                )}
                            </div>
                            {/* Información del Período */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="mb-4 flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Período Facturado
                                    </h2>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">
                                            Fecha de inicio
                                        </label>
                                        <p className="mt-1 text-lg font-medium text-gray-900">
                                            {formatDate(bill.date_from)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">
                                            Fecha de fin
                                        </label>
                                        <p className="mt-1 text-lg font-medium text-gray-900">
                                            {formatDate(bill.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items Facturados */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <Package className="h-5 w-5 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Items Facturados ({billItems.length})
                                </h2>
                            </div>

                            {billItems.length > 0 ? (
                                <div className="overflow-hidden rounded-lg border border-gray-200">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Producto
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Cantidad
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Días
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Costo/día
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Subtotal
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {billItems.map((item) => {
                                                if (
                                                    !item?.stock_movement
                                                        ?.product
                                                ) {
                                                    return null;
                                                }

                                                const product =
                                                    item.stock_movement.product;
                                                let cost =
                                                    product.current_cost || 0;

                                                if (
                                                    !cost &&
                                                    product.costs &&
                                                    product.costs.length > 0
                                                ) {
                                                    cost =
                                                        product.costs[0]
                                                            .price || 0;
                                                }

                                                const qty =
                                                    item.stock_movement.qty ||
                                                    0;
                                                const days = item.days || 0;
                                                const subtotal =
                                                    cost * qty * days;

                                                return (
                                                    <tr
                                                        key={item.id}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                                                                    <span className="font-medium text-blue-600">
                                                                        {(
                                                                            product.name ||
                                                                            'P'
                                                                        )
                                                                            .charAt(
                                                                                0,
                                                                            )
                                                                            .toUpperCase()}
                                                                    </span>
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {product.name ||
                                                                            'Sin nombre'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                                                {qty}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                                            {days} día(s)
                                                        </td>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                                                            {formatCurrency(
                                                                cost,
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                                                            {formatCurrency(
                                                                subtotal,
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot className="bg-gray-50">
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="px-6 py-4 text-right text-sm font-medium text-gray-900"
                                                >
                                                    Total:
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                                    {formatCurrency(
                                                        bill.amount,
                                                    )}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <div className="rounded-lg border border-gray-200 bg-gray-50 py-12 text-center">
                                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-500">
                                        No hay items en esta factura
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar con información adicional */}
                    <div className="space-y-6"></div>
                </div>
            </div>
        </AppLayout>
    );
}
