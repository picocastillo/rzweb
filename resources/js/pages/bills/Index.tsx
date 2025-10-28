import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { FileText, Filter, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
    product?: Product; // Hacerlo opcional
}

interface BillItem {
    id: number;
    bill_id: number;
    days: number;
    stock_movement_id: number;
    stock_movement?: StockMovement; // Hacerlo opcional
}

interface Bill {
    id: number;
    client_id: number;
    date_from: string;
    amount: number;
    created_at: string;
    client?: Client; // Hacerlo opcional
    bill_items?: BillItem[]; // Hacerlo opcional
}

interface Props {
    bills: Bill[];
}

export default function IndexBills({ bills = [] }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [openBillIds, setOpenBillIds] = useState<number[]>([]); 

    // Filtrar facturas por búsqueda con validaciones
    const filteredBills = bills.filter((bill) => {
        if (!bill || !bill.client) return false;

        const searchLower = searchTerm.toLowerCase();
        return (
            bill.client.name?.toLowerCase().includes(searchLower) ||
            bill.client.cuil?.toLowerCase().includes(searchLower) ||
            bill.id?.toString().includes(searchLower)
        );
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Facturas', href: '/bills' },
    ];

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
            return 'Fecha inválida';
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

    const toggleCollapse = (id: number) => {
        setOpenBillIds((prev) =>
            prev.includes(id)
                ? prev.filter((billId) => billId !== id)
                : [...prev, id]
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Facturas" />
            <div className="p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
                                <FileText className="h-8 w-8 text-blue-600" />
                                Facturas
                            </h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Gestiona y visualiza todas las facturas
                            </p>
                        </div>
                        <button
                            onClick={() => router.visit('/bills/create')}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-blue-700"
                        >
                            <Plus className="h-5 w-5" />
                            Nueva Factura
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 rounded-lg bg-gray-50 p-6 shadow dark:bg-gray-900">
                    <div className="mb-4 flex items-center gap-2">
                        <Filter className="h-5 w-5 text-gray-600" />
                        <h2 className="text-lg font-semibold text-white">
                            Filtros
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="relative">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Buscar
                            </label>
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cliente, CUIL o ID de factura..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full rounded-md border border-gray-300 py-2 pr-3 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>

                {/* Bills List */}
                <div className="space-y-6">
                {filteredBills.length > 0 ? (
                    filteredBills.map((bill) => {
                        if (!bill || !bill.client) return null;
                        const billItems = bill.bill_items || [];
                        const isOpen = openBillIds.includes(bill.id);

                            return (
                            <div
                                key={bill.id}
                                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                            >
                                {/* Header de la factura */}
                                <div
                                    className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 cursor-pointer select-none"
                                    onClick={() => toggleCollapse(bill.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-900">
                                                Factura #{bill.id}
                                            </h1>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">
                                                    Total
                                                </p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    ${formatCurrency(bill.amount)}
                                                </p>
                                            </div>
                                            {isOpen ? (
                                                <ChevronUp className="ml-4 h-6 w-6 text-gray-600" />
                                            ) : (
                                                <ChevronDown className="ml-4 h-6 w-6 text-gray-600" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                    {isOpen && (
                                        <div className="p-6">
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            {/* Información del Cliente */}
                                            <div className="rounded-lg bg-gray-50 p-4">
                                                <h2 className="mb-3 text-lg font-semibold text-gray-900">
                                                    Información del Cliente
                                                </h2>
                                                <div className="space-y-2">
                                                    <div>
                                                        <p className="text-sm text-gray-500">
                                                            Nombre
                                                        </p>
                                                        <p className="font-medium text-black">
                                                            {bill.client.name ||
                                                                'N/A'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">
                                                            CUIL
                                                        </p>
                                                        <p className="font-medium text-black">
                                                            {bill.client.cuil ||
                                                                'N/A'}
                                                        </p>
                                                    </div>
                                                    {bill.client.phone && (
                                                        <div>
                                                            <p className="text-sm text-gray-500">
                                                                Teléfono
                                                            </p>
                                                            <p className="font-medium text-black">
                                                                {
                                                                    bill.client
                                                                        .phone
                                                                }
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Información del período */}
                                            <div className="rounded-lg bg-gray-50 p-4">
                                                <h2 className="mb-3 text-lg font-semibold text-gray-900">
                                                    Detalles
                                                </h2>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-500">
                                                            Fecha de inicio:
                                                        </span>
                                                        <span className="font-medium text-black">
                                                            {formatDate(
                                                                bill.date_from,
                                                            )}
                                                        </span>
                                                    </div>
                                                    {/* <div className="flex justify-between">
                                                        <span className="text-sm text-gray-500">
                                                            Fecha de fin:
                                                        </span>
                                                        <span className="font-medium text-black">
                                                            {formatDate(bill.created_at)}
                                                        </span>
                                                    </div> */}
                                                    <div className="flex justify-between border-t border-gray-200 pt-2">
                                                        <span className="text-sm text-gray-500">
                                                            Total Items:
                                                        </span>
                                                        <span className="font-medium text-black">
                                                            {billItems.length}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Items Facturados */}
                                        <div className="mt-6">
                                            <div className="mb-4 flex items-center justify-between">
                                                <h2 className="text-lg font-semibold text-gray-900">
                                                    Items Facturados
                                                </h2>
                                                <span className="text-sm text-gray-500">
                                                    {billItems.length} item(s)
                                                </span>
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
                                                                    Tipo
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                                    Subtotal
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-200 bg-white">
                                                            {billItems.map(
                                                                (item) => {
                                                                    if (
                                                                        !item ||
                                                                        !item.stock_movement ||
                                                                        !item
                                                                            .stock_movement
                                                                            .product
                                                                    ) {
                                                                        return null;
                                                                    }

                                                                    const product =
                                                                        item
                                                                            .stock_movement
                                                                            .product;

                                                                    let cost =
                                                                        product.current_cost ||
                                                                        0;

                                                                    if (
                                                                        !cost &&
                                                                        product.costs &&
                                                                        product
                                                                            .costs
                                                                            .length >
                                                                            0
                                                                    ) {
                                                                        cost =
                                                                            product
                                                                                .costs[0]
                                                                                .price ||
                                                                            0;
                                                                    }

                                                                    const qty =
                                                                        item
                                                                            .stock_movement
                                                                            .qty ||
                                                                        0;
                                                                    const days =
                                                                        item.days ||
                                                                        0;
                                                                    const subtotal =
                                                                        cost *
                                                                        qty *
                                                                        days;

                                                                    return (
                                                                        <tr
                                                                            key={
                                                                                item.id
                                                                            }
                                                                            className="transition-colors hover:bg-gray-50"
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
                                                                                        {/* <div className="text-sm text-gray-500">
                                                                                            $
                                                                                            {formatCurrency(
                                                                                                cost,
                                                                                            )}
                                                                                            /día
                                                                                        </div> */}
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                                                                    {
                                                                                        qty
                                                                                    }
                                                                                </span>
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                                <span className="text-sm font-medium text-gray-900">
                                                                                    {
                                                                                        days
                                                                                    }{' '}
                                                                                    día(s)
                                                                                </span>
                                                                            </td>
                                                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                                                                {item
                                                                                    .stock_movement
                                                                                    .type ||
                                                                                    'N/A'}
                                                                            </td>
                                                                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                                                                                $
                                                                                {formatCurrency(
                                                                                    subtotal,
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                },
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="rounded-lg border border-gray-200 bg-gray-50 py-12 text-center">
                                                    <p className="text-sm text-gray-500">
                                                        No hay items en esta
                                                        factura
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-12 text-center">
                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                No hay facturas
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm
                                    ? 'No se encontraron facturas con esos criterios de búsqueda'
                                    : 'Comienza creando tu primera factura'}
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={() =>
                                        router.visit('/bills/create')
                                    }
                                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4" />
                                    Nueva Factura
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
