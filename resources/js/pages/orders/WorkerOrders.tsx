import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { MapPin, Calendar, User, ArrowRight, Info } from 'lucide-react';

type Order = {
    id: number;
    code: string;
    address: string;
    client_name: string;
    created_at: string;
    status: string;
};

type WorkerOrdersProps = {
    orders: Order[];
    worker_name: string;
    total_orders: number;
};

export default function WorkerOrders({ orders, worker_name, total_orders }: WorkerOrdersProps) {
    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Mis Órdenes', href: '/worker/orders' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis Órdenes" />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Header Simple */}
                <div className="bg-blue-600 dark:bg-blue-800 text-white p-4 shadow-lg">
                    <div className="max-w-2xl mx-auto">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">Mis Órdenes</h1>
                                <p className="text-blue-100 dark:text-blue-200 text-sm mt-1">
                                    Hola, {worker_name} 👋
                                </p>
                            </div>
                            <div className="text-right bg-blue-700 dark:bg-blue-900 px-3 py-2 rounded-lg">
                                <p className="text-lg font-semibold">{total_orders}</p>
                                <p className="text-blue-100 dark:text-blue-300 text-xs">Órdenes activas</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mensaje de ayuda */}
<div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 mx-4 mt-4 rounded">
                    <div className="flex items-start">
                        <Info className="flex-shrink-0 text-yellow-500 dark:text-yellow-400 mt-0.5 mr-3" size={18} />
                        <div>
                            <p className="text-sm text-yellow-800 dark:text-yellow-300 font-semibold">
                                ¿Qué hacer aquí?
                            </p>
                            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                                Toca cualquier orden para ver los detalles,comenzar con la orden, agregar o quitar productos y finalizarla cuando hayas terminado.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Lista de Órdenes */}
                <div className="p-4 max-w-2xl mx-auto">
                    {orders.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                            <div className="text-gray-400 dark:text-gray-500 mb-4">
                                <MapPin size={48} className="mx-auto" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                                No tenés órdenes asignadas
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Cuando te asignen órdenes, aparecerán aquí.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    onClick={() => router.visit(`/orders/${order.id}`)}
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 active:bg-blue-50 dark:active:bg-blue-900/20 transition-colors cursor-pointer"
                                >
                                    {/* Header de la orden */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-sm font-semibold">
                                                #{order.code}
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                {order.created_at}
                                            </span>
                                        </div>
                                        <ArrowRight className="text-gray-400 dark:text-gray-500" size={18} />
                                    </div>

                                    {/* Información principal */}
                                    <div className="space-y-2">
                                        <div className="flex items-start space-x-2">
                                            <MapPin className="text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" size={16} />
                                            <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                                                {order.address}
                                            </span>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <User className="text-gray-400 dark:text-gray-500 flex-shrink-0" size={16} />
                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                {order.client_name}
                                            </span>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Calendar className="text-gray-400 dark:text-gray-500 flex-shrink-0" size={16} />
                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                Estado: <span className="font-medium text-green-600 dark:text-green-400">{order.status}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Indicador de tocar */}
                                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                        <p className="text-xs text-blue-600 dark:text-blue-400 text-center font-medium">
                                            TOCÁ PARA VER DETALLES →
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Footer con instrucciones simples */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            💡 <strong>Recordá:</strong> Tocá una orden para trabajar en ella
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}