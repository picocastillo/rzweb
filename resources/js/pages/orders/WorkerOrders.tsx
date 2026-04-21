import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { ArrowRight, Calendar, Info, MapPin, User } from 'lucide-react';

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

export default function WorkerOrders({
    orders,
    worker_name,
    total_orders,
}: WorkerOrdersProps) {
    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Mis Órdenes', href: '/worker/orders' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis Órdenes" />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Header Simple */}
                <div className="bg-blue-600 p-4 text-white shadow-lg dark:bg-blue-800">
                    <div className="mx-auto max-w-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">
                                    Mis Órdenes
                                </h1>
                                <p className="mt-1 text-sm text-blue-100 dark:text-blue-200">
                                    Hola, {worker_name} 👋
                                </p>
                            </div>
                            <div className="rounded-lg bg-blue-700 px-3 py-2 text-right dark:bg-blue-900">
                                <p className="text-lg font-semibold">
                                    {total_orders}
                                </p>
                                <p className="text-xs text-blue-100 dark:text-blue-300">
                                    Órdenes activas
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mensaje de ayuda */}
                <div className="mx-4 mt-4 rounded border-l-4 border-yellow-400 bg-yellow-50 p-4 dark:border-yellow-600 dark:bg-yellow-900/20">
                    <div className="flex items-start">
                        <Info
                            className="mt-0.5 mr-3 flex-shrink-0 text-yellow-500 dark:text-yellow-400"
                            size={18}
                        />
                        <div>
                            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                                ¿Qué hacer aquí?
                            </p>
                            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
                                Toca cualquier orden para ver los
                                detalles,comenzar con la orden, agregar o quitar
                                productos y finalizarla cuando hayas terminado.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Lista de Órdenes */}
                <div className="mx-auto max-w-2xl p-4">
                    {orders.length === 0 ? (
                        <div className="rounded-lg bg-white py-12 text-center shadow dark:bg-gray-800">
                            <div className="mb-4 text-gray-400 dark:text-gray-500">
                                <MapPin size={48} className="mx-auto" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-gray-600 dark:text-gray-300">
                                No tenés órdenes asignadas
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Cuando te asignen órdenes, aparecerán aquí.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    onClick={() =>
                                        router.visit(`/orders/${order.id}`)
                                    }
                                    className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors active:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:active:bg-blue-900/20"
                                >
                                    {/* Header de la orden */}
                                    <div className="mb-3 flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div className="rounded bg-blue-100 px-2 py-1 text-sm font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                #{order.code}
                                            </div>
                                            <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                                                {order.created_at}
                                            </span>
                                        </div>
                                        <ArrowRight
                                            className="text-gray-400 dark:text-gray-500"
                                            size={18}
                                        />
                                    </div>

                                    {/* Información principal */}
                                    <div className="space-y-2">
                                        <div className="flex items-start space-x-2">
                                            <MapPin
                                                className="mt-0.5 flex-shrink-0 text-gray-400 dark:text-gray-500"
                                                size={16}
                                            />
                                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                {order.address}
                                            </span>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <User
                                                className="flex-shrink-0 text-gray-400 dark:text-gray-500"
                                                size={16}
                                            />
                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                {order.client_name}
                                            </span>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Calendar
                                                className="flex-shrink-0 text-gray-400 dark:text-gray-500"
                                                size={16}
                                            />
                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                Estado:{' '}
                                                <span className="font-medium text-green-600 dark:text-green-400">
                                                    {order.status}
                                                </span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Indicador de tocar */}
                                    <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-700">
                                        <p className="text-center text-xs font-medium text-blue-600 dark:text-blue-400">
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
                            💡 <strong>Recordá:</strong> Tocá una orden para
                            trabajar en ella
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
