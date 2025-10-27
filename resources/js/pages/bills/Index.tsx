//import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { FileText, Filter, Plus, Search } from 'lucide-react';
import { useState } from 'react';

interface Client {
    id: number;
    name: string;
    cuil: string;
    orders: Order[];
}

interface Order {
    id: number;
    user_id: number;
    client_id: number;
    last_state: string;
    address: string;
    code: string;
    date_from: string;
    date_to: string;
    is_active: boolean;
    stock_movements: {
        id: number;
        order_id: number;
        product_id: number;
        qty: number;
        product: {
            id: number;
            name: string;
        } | null;
    }[];
}

interface Bill {
    id: number;
    client_id: number;
    client: Client;
    date_from: string;
    amount: number;
    name: string;
    cuil: string;
    phone: string;
    created_at: string;
}

interface Props {
    bills: Bill[];
    clients: Client[];
}

export default function IndexBills({ clients }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMonth, setFilterMonth] = useState('');
    const [filterYear, setFilterYear] = useState('');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Facturas', href: '/bills' },
    ];

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
                                    placeholder="Cliente, nombre o CUIL..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full rounded-md border border-gray-300 py-2 pr-3 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {(searchTerm || filterMonth || filterYear) && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterMonth('');
                                setFilterYear('');
                            }}
                            className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>

                {/* Bills Table */}
                <div className="overflow-hidden rounded-lg bg-gray-50 shadow dark:bg-gray-900">
                                                <div
                                
                                className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                            >
                                <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-900">
                                                Factura #Numero
                                            </h1>
                                            <p className="mt-1 text-gray-600">
                                                (aca va el periodo facturado tanto a tanto)
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-sm font-medium`}
                                            >
                                                Estado
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">

                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
 
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
                                                                    Cuil
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-500">
                                                                    Teléfono
                                                                </p>
                                                                <p className="font-medium text-black">
                                                                   
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                    
                                                    {/* Información del alquiler */}
                                                    <div className="rounded-lg bg-gray-50 p-4">
                                                        <h2 className="mb-3 text-lg font-semibold text-gray-900">
                                                            Detalles del Alquiler
                                                        </h2>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between">
                                                                <span className="text-sm text-gray-500">
                                                                    Fecha de inicio:
                                                                </span>
                                                                {/* <span className="font-medium text-black">
                                                                    {formatDate(order.date_from)}
                                                                </span> */}
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-sm text-gray-500">
                                                                    Fecha de fin:
                                                                </span>
                                                                {/* <span className="font-medium text-black">
                                                                    {formatDate(order.date_to)}
                                                                </span> */}
                                                            </div>
                                                            <div className="flex justify-between border-t border-gray-200 pt-2">
                                                                <span className="text-sm text-gray-500">
                                                                    Duración:
                                                                </span>
                                                                <span className="font-medium text-black">
                                                                    {/* {calculateRentalDays()} días */}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                    

                                                <div>
                                                    <div className="mb-4 flex items-center justify-between">
                                                        <h2 className="text-lg font-semibold text-gray-900">
                                                            Items Facturados
                                                        </h2>
                                                        <span className="text-sm text-gray-500">
                                                            (0)
                                                            movimiento(s)
                                                        </span>
                                                    </div>
                    

                                                        <div className="overflow-hidden rounded-lg border border-gray-200">
                                                            <table className="min-w-full divide-y divide-gray-200">
                                                                <thead className="bg-gray-50">
                                                                    <tr>
                                                                        <th
                                                                            scope="col"
                                                                            className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                                                                        >
                                                                            Producto
                                                                        </th>
                                                                        <th
                                                                            scope="col"
                                                                            className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                                                                        >
                                                                            Cantidad
                                                                        </th>
                                                                        <th
                                                                            scope="col"
                                                                            className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                                                                        >
                                                                            Tipo
                                                                        </th>
                                                                        <th
                                                                            scope="col"
                                                                            className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                                                                        >
                                                                            Fecha
                                                                        </th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-200 bg-white">

                                                                            <tr

                                                                                className="transition-colors hover:bg-gray-50"
                                                                            >
                                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                                    <div className="flex items-center">
                                                                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                                                                                            <span className="font-medium text-blue-600">
                                                                                                P
                                                                                            </span>
                                                                                        </div>
                                                                                        <div className="ml-4">
                                                                                            <div className="text-sm font-medium text-gray-900">
                                                                                                Nombre producto
                                                                                            </div>
                                                                                            <div className="text-sm text-gray-500">
                                                                                                ID: #
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                                    <span
                                                                                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" 
                                                                                    >
                                                                                        Cantidad
                                                                                    </span>
                                                                                </td>
                                                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                                                                    Tipo de movimiento
                                                                                </td>
                                                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                                                                    Dias facturados
                                                                                </td>
                                                                            </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                </div>

                                        </div>
                                    </div>
                    {/* Render bills or orders */}
                    {/* {clients.map((client) =>
                        client.orders.map((order) => (
                            <div
                                key={order.id}
                                className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                            >
                                <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-900">
                                                Factura #{order.code}
                                            </h1>
                                            <p className="mt-1 text-gray-600">
                                                (aca va el periodo facturado tanto a tanto)
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-sm font-medium`}
                                            >
                                                {order.last_state}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">

                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
 
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
                                                                    {client.name}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-500">
                                                                    Teléfono
                                                                </p>
                                                                <p className="font-medium text-black">
                                                                   
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div> */}
                    
                                                    {/* Información del alquiler */}
                                                    {/* <div className="rounded-lg bg-gray-50 p-4">
                                                        <h2 className="mb-3 text-lg font-semibold text-gray-900">
                                                            Detalles del Alquiler
                                                        </h2>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between">
                                                                <span className="text-sm text-gray-500">
                                                                    Fecha de inicio:
                                                                </span> */}
                                                                {/* <span className="font-medium text-black">
                                                                    {formatDate(order.date_from)}
                                                            //     </span> */}
                                                            {/* </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-sm text-gray-500">
                                                                    Fecha de fin:
                                                                </span> */}
                                                                {/* <span className="font-medium text-black">
                                                                    {formatDate(order.date_to)}
                                                                </span> */}
                                                            {/* </div>
                                                            <div className="flex justify-between border-t border-gray-200 pt-2">
                                                                <span className="text-sm text-gray-500">
                                                                    Duración:
                                                                </span>
                                                                <span className="font-medium text-black"> */}
                                                                    {/* {calculateRentalDays()} días */}
                                                                {/* </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                    

                                                <div>
                                                    <div className="mb-4 flex items-center justify-between">
                                                        <h2 className="text-lg font-semibold text-gray-900">
                                                            Items Facturados
                                                        </h2>
                                                        <span className="text-sm text-gray-500">
                                                            {order.stock_movements.length}{' '}
                                                            movimiento(s)
                                                        </span>
                                                    </div>
                    
                                                    {order.stock_movements.length > 0 ? (
                                                        <div className="overflow-hidden rounded-lg border border-gray-200">
                                                            <table className="min-w-full divide-y divide-gray-200">
                                                                <thead className="bg-gray-50">
                                                                    <tr>
                                                                        <th
                                                                            scope="col"
                                                                            className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                                                                        >
                                                                            Producto
                                                                        </th>
                                                                        <th
                                                                            scope="col"
                                                                            className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                                                                        >
                                                                            Cantidad
                                                                        </th>
                                                                        <th
                                                                            scope="col"
                                                                            className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                                                                        >
                                                                            Tipo
                                                                        </th>
                                                                        <th
                                                                            scope="col"
                                                                            className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                                                                        >
                                                                            Fecha
                                                                        </th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-200 bg-white">
                                                                    {order.stock_movements.map(
                                                                        (sm) => (
                                                                            <tr
                                                                                key={sm.id}
                                                                                className="transition-colors hover:bg-gray-50"
                                                                            >
                                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                                    <div className="flex items-center">
                                                                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                                                                                            <span className="font-medium text-blue-600">
                                                                                                P
                                                                                            </span>
                                                                                        </div>
                                                                                        <div className="ml-4">
                                                                                            <div className="text-sm font-medium text-gray-900">
                                                                                                Nombre producto
                                                                                            </div>
                                                                                            <div className="text-sm text-gray-500">
                                                                                                ID:{' '}
                                                                                                {
                                                                                                    sm.id
                                                                                                }
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                                    <span
                                                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sm.qty > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                                                                    >
                                                                                        {sm.qty > 0
                                                                                            ? '+'
                                                                                            : ''}
                                                                                        {sm.qty}
                                                                                    </span>
                                                                                </td>
                                                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                                                                    Tipo de movimiento
                                                                                </td>
                                                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                                                                    Hace cuantos dias que esta
                                                                                </td>
                                                                            </tr>
                                                                        ),
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <div className="rounded-lg border border-gray-200 bg-gray-50 py-12 text-center">
                                                            <svg
                                                                className="mx-auto h-12 w-12 text-gray-400"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1M9 7h6"
                                                                />
                                                            </svg>
                                                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                                                No hay movimientos de stock
                                                            </h3>
                                                            <p className="mt-1 text-sm text-gray-500">
                                                                No se han registrado movimientos de
                                                                stock para esta orden.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                        </div>
                                    </div>
                        )),
                    )} */}
                </div>
            </div>
        </AppLayout>
    );
}
