import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { usePage, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { OrderShowProps } from '@/types/order';
import { formatDate, calculateRentalDays, getStatusColor } from '@/utils/order-utils';
import StockMovementModal from '@/components/order/StockMovementModal';

export default function Show() {
    const { order, products, allProducts } = usePage().props as unknown as OrderShowProps;

    const [activeTab, setActiveTab] = useState('details');
    const [showModal, setShowModal] = useState(false);
    const { reset } = useForm({
        product_id: '',
        qty: '',
        general: '',
        type: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Órdenes', href: '/orders' },
        { title: `Orden #${order.code}`, href: `/orders/${order.id}` },
    ];

    // Cerrar modal y resetear formulario
    const handleCloseModal = () => {
        setShowModal(false);
        reset();
    };

    const TYPE = { 
        2: 'Ingreso',
        0: 'Egreso',
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="mx-auto max-w-6xl p-6">
                {/* Header de la orden */}
                <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Orden #{order.code}
                                </h1>
                                <p className="mt-1 text-gray-600">
                                    Creada el {formatDate(order.date_from)}
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span
                                    className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(order.name_last_state)}`}
                                >
                                    {order.name_last_state}
                                </span>
                                {/* <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                                    Editar Orden
                                </button> */}
                                <Button
                                    type="button"
                                    onClick={() => setShowModal(true)}
                                    variant={'success'}
                                >
                                    Agregar Movimiento
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Tabs de navegación */}
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex">
                            <button
                                className={`border-b-2 px-6 py-4 text-center text-sm font-medium ${activeTab === 'details' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('details')}
                            >
                                Detalles
                            </button>
                            <button
                                className={`border-b-2 px-6 py-4 text-center text-sm font-medium ${activeTab === 'stock' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('stock')}
                            >
                                Movimientos de Stock
                            </button>
                        </nav>
                    </div>

                    {/* Contenido de las tabs */}
                    <div className="p-6">
                        {activeTab === 'details' && (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Información del cliente */}
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <h2 className="mb-3 text-lg font-semibold text-gray-900">
                                        Información del Cliente
                                    </h2>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Nombre
                                            </p>
                                            <p className="text-black">
                                                {order.client.name}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Teléfono
                                            </p>
                                            <p className="text-black">
                                                {order.client.phone}
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
                                            <span className="text-black">
                                                {formatDate(order.date_from)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-500">
                                                Fecha de fin:
                                            </span>
                                            <span className="text-black">
                                                {formatDate(order.date_to)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-t border-gray-200 pt-2">
                                            <span className="text-sm text-gray-500">
                                                Duración:
                                            </span>
                                            <span className="text-black">
                                                {calculateRentalDays(order.date_from, order.date_to)} días
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'stock' && (
                            <div>
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Movimientos de Stock
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
                                                                            {
                                                                                sm
                                                                                    .product
                                                                                    .name
                                                                            }
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
                                                                {TYPE[sm.type]}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                                                {new Date(
                                                                    sm.created_at,
                                                                ).toLocaleString(
                                                                    'es-ES',
                                                                )}
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
                        )}
                    </div>
                </div>

                {showModal && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
                        <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
                            <StockMovementModal 
                                order={order}
                                products={products}
                                allProducts={allProducts}
                                showModal={showModal}
                                onClose={handleCloseModal}
                            />
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
