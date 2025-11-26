import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { FileText, Filter, Plus, Search } from 'lucide-react';
import { useState } from 'react';

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
    bills: Bill[];
}

export default function IndexBills({ bills = [] }: Props) {
    const [searchTerm, setSearchTerm] = useState('');

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
                month: 'short',
                day: 'numeric',
            });
        } catch (error) {
            return 'Fecha inválida' + error;
        }
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
                        <Button
                            variant="success"
                            onClick={() => router.visit('/bills/create')}
                        >
                            <Plus size={18} /> Nueva Factura
                        </Button>
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

                {/* Bills Table */}
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    {filteredBills.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        ID Factura
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Cliente
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Período
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {filteredBills.map((bill) => {
                                    if (!bill || !bill.client) return null;

                                    return (
                                        <tr
                                            key={bill.id}
                                            className="transition-colors hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                                                    #{bill.id}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {bill.client.name || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {formatDate(bill.date_from)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    al{' '}
                                                    {formatDate(
                                                        bill.created_at,
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Button
                                                    onClick={() =>
                                                        router.visit(
                                                            `/bills/${bill.id}`,
                                                        )
                                                    }
                                                    variant={'default'}
                                                >
                                                    Detalles
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
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
