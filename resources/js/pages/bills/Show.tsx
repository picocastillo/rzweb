import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Download,
    FileText,
    MapPin,
    Package,
    User,
} from 'lucide-react';

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

interface OrderSummary {
    id: number;
    address?: string | null;
}

interface StockMovement {
    id: number;
    product_id: number;
    type: string;
    qty: number;
    created_at: string;
    product?: Product;
    order?: OrderSummary | null;
}

interface BillItem {
    id: number;
    bill_id: number;
    days: number;
    unit_price: number;
    stock_movement_id: number;
    stock_movement?: StockMovement;
}

interface Bill {
    id: number;
    client_id: number;
    date_from: string;
    date_to?: string | null;
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

    // Formatear moneda con validación
    const formatCurrency = (amount?: number) => {
        if (amount === undefined || amount === null) return '$0.00';

        return amount.toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const formatDate = (date?: string | null) => {
        if (!date) return '—';

        try {
            return new Date(date).toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return 'Fecha inválida';
        }
    };

    const formatDateTime = (date?: string | null) => {
        if (!date) return '—';

        try {
            return new Date(date).toLocaleString('es-AR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return 'Fecha inválida';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Factura #${bill.id}`} />
            <div className="p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="mt-3 flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div>
                                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    Detalles completos de la factura #{bill.id}
                                </p>
                            </div>
                        </div>
                        <a
                            href={`/bills/${bill.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-gray-900"
                        >
                            <Download className="h-4 w-4" />
                            Generar PDF
                        </a>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Información Principal */}
                    <div className="space-y-6 lg:col-span-2">
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            {/* Información del Cliente */}
                            <div className="mb-4 flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Información del Cliente
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Nombre
                                    </label>
                                    <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                                        {bill.client?.name || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                        CUIL
                                    </label>
                                    <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                                        {bill.client?.cuil || 'N/A'}
                                    </p>
                                </div>
                                {bill.client?.phone && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Teléfono
                                        </label>
                                        <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                                            {bill.client.phone}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
                                <div className="mb-4 flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Período facturado
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Desde
                                        </label>
                                        <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                                            {formatDate(bill.date_from)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Hasta
                                        </label>
                                        <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                                            {bill.date_to
                                                ? formatDate(bill.date_to)
                                                : '—'}
                                        </p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Creada el
                                        </label>
                                        <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                                            {formatDateTime(bill.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items Facturados */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <div className="mb-4 flex items-center gap-2">
                                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Items Facturados ({billItems.length})
                                </h2>
                            </div>

                            {billItems.length > 0 ? (
                                <>
                                    {/* Mobile: card list */}
                                    <ul className="space-y-3 md:hidden">
                                        {billItems.map((item) => {
                                            if (
                                                !item?.stock_movement?.product
                                            ) {
                                                return null;
                                            }

                                            const product =
                                                item.stock_movement.product;
                                            let cost = item.unit_price ?? 0;
                                            if (!cost) {
                                                cost =
                                                    product.current_cost || 0;
                                            }
                                            if (
                                                !cost &&
                                                product.costs &&
                                                product.costs.length > 0
                                            ) {
                                                cost =
                                                    product.costs[0].price || 0;
                                            }

                                            const qty =
                                                item.stock_movement.qty || 0;
                                            const days = item.days || 0;
                                            const subtotal = cost * qty * days;

                                            return (
                                                <li
                                                    key={item.id}
                                                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                                            <span className="font-medium text-blue-600 dark:text-blue-300">
                                                                {(
                                                                    product.name ||
                                                                    'P'
                                                                )
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                                                {product.name ||
                                                                    'Sin nombre'}
                                                            </p>
                                                            <div className="mt-1 flex items-start gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                                <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                                                                <span className="break-words">
                                                                    {item.stock_movement?.order?.address?.trim() ||
                                                                        '—'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-gray-100 pt-3 text-sm dark:border-gray-700">
                                                        <div>
                                                            <dt className="text-xs text-gray-500 dark:text-gray-400">
                                                                Cantidad
                                                            </dt>
                                                            <dd className="mt-0.5 text-gray-900 dark:text-white">
                                                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                                    {qty}
                                                                </span>
                                                            </dd>
                                                        </div>
                                                        <div>
                                                            <dt className="text-xs text-gray-500 dark:text-gray-400">
                                                                Días
                                                            </dt>
                                                            <dd className="mt-0.5 text-gray-900 dark:text-white">
                                                                {days} día(s)
                                                            </dd>
                                                        </div>
                                                        <div>
                                                            <dt className="text-xs text-gray-500 dark:text-gray-400">
                                                                Costo/día
                                                            </dt>
                                                            <dd className="mt-0.5 text-gray-900 dark:text-white">
                                                                {formatCurrency(
                                                                    cost,
                                                                )}
                                                            </dd>
                                                        </div>
                                                        <div>
                                                            <dt className="text-xs text-gray-500 dark:text-gray-400">
                                                                Subtotal
                                                            </dt>
                                                            <dd className="mt-0.5 font-semibold text-gray-900 dark:text-white">
                                                                {formatCurrency(
                                                                    subtotal,
                                                                )}
                                                            </dd>
                                                        </div>
                                                    </dl>
                                                </li>
                                            );
                                        })}

                                        <li className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    Total
                                                </span>
                                                <span className="text-base font-bold text-gray-900 dark:text-white">
                                                    {formatCurrency(
                                                        bill.amount,
                                                    )}
                                                </span>
                                            </div>
                                        </li>
                                    </ul>

                                    {/* Tablet/Desktop: table */}
                                    <div className="hidden overflow-x-auto rounded-lg border border-gray-200 md:block dark:border-gray-700">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-900">
                                                <tr>
                                                    <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase lg:px-6 dark:text-gray-400">
                                                        Producto
                                                    </th>
                                                    <th className="hidden px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase lg:table-cell lg:px-6 dark:text-gray-400">
                                                        Dirección
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase lg:px-6 dark:text-gray-400">
                                                        Cantidad
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase lg:px-6 dark:text-gray-400">
                                                        Días
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase lg:px-6 dark:text-gray-400">
                                                        Costo/día
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase lg:px-6 dark:text-gray-400">
                                                        Subtotal
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                                {billItems.map((item) => {
                                                    if (
                                                        !item?.stock_movement
                                                            ?.product
                                                    ) {
                                                        return null;
                                                    }

                                                    const product =
                                                        item.stock_movement
                                                            .product;

                                                    // Prefer the price that was
                                                    // snapshotted when the bill
                                                    // was created so the historical
                                                    // amount is preserved even when
                                                    // the product cost changes.
                                                    let cost =
                                                        item.unit_price ?? 0;

                                                    if (!cost) {
                                                        cost =
                                                            product.current_cost ||
                                                            0;
                                                    }

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
                                                        item.stock_movement
                                                            .qty || 0;
                                                    const days = item.days || 0;
                                                    const subtotal =
                                                        cost * qty * days;

                                                    return (
                                                        <tr
                                                            key={item.id}
                                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                                        >
                                                            <td className="px-3 py-4 lg:px-6">
                                                                <div className="flex items-center">
                                                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                                                        <span className="font-medium text-blue-600 dark:text-blue-300">
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
                                                                    <div className="ml-3 min-w-0 lg:ml-4">
                                                                        <div className="text-sm font-medium break-words text-gray-900 dark:text-white">
                                                                            {product.name ||
                                                                                'Sin nombre'}
                                                                        </div>
                                                                        <div className="mt-1 flex items-start gap-1 text-xs text-gray-500 lg:hidden dark:text-gray-400">
                                                                            <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0" />
                                                                            <span className="break-words">
                                                                                {item.stock_movement?.order?.address?.trim() ||
                                                                                    '—'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="hidden max-w-xs px-3 py-4 text-sm text-gray-900 lg:table-cell lg:px-6 dark:text-white">
                                                                <div className="flex gap-2">
                                                                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                                                                    <span className="break-words">
                                                                        {item.stock_movement?.order?.address?.trim() ||
                                                                            '—'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-4 whitespace-nowrap lg:px-6">
                                                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                                    {qty}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-900 lg:px-6 dark:text-white">
                                                                {days} día(s)
                                                            </td>
                                                            <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-900 lg:px-6 dark:text-white">
                                                                {formatCurrency(
                                                                    cost,
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-4 text-sm font-medium whitespace-nowrap text-gray-900 lg:px-6 dark:text-white">
                                                                {formatCurrency(
                                                                    subtotal,
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                            <tfoot className="bg-gray-50 dark:bg-gray-900">
                                                <tr>
                                                    <td
                                                        colSpan={5}
                                                        className="hidden px-3 py-4 text-right text-sm font-medium text-gray-900 lg:table-cell lg:px-6 dark:text-white"
                                                    >
                                                        Total:
                                                    </td>
                                                    <td
                                                        colSpan={4}
                                                        className="px-3 py-4 text-right text-sm font-medium text-gray-900 lg:hidden dark:text-white"
                                                    >
                                                        Total:
                                                    </td>
                                                    <td className="px-3 py-4 text-sm font-bold whitespace-nowrap text-gray-900 lg:px-6 dark:text-white">
                                                        {formatCurrency(
                                                            bill.amount,
                                                        )}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </>
                            ) : (
                                <div className="rounded-lg border border-gray-200 bg-gray-50 py-12 text-center dark:border-gray-700 dark:bg-gray-700">
                                    <Package className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
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
