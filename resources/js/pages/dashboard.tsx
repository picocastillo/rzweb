//import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Package, ShoppingCart, DollarSign, Users, TrendingUp, AlertCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Menú',
        href: dashboard().url,
    },
];

interface DashboardProps {
    stats: {
        activeOrders: number;
        pendingBills: number;
        totalRevenue: number;
        lowStockProducts: number;
        totalClients: number;
        productsInRental: number;
    };
    recentOrders: Array<{
        id: number;
        code: string;
        client_name: string;
        date_from: string;
        last_state: string;
    }>;
    topProducts: Array<{
        id: number;
        name: string;
        stock_in_rental: number;
        available_stock: number;
        current_cost: number;
    }>;
}

export default function Dashboard({ stats, recentOrders, topProducts }: DashboardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}> 
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Tarjetas de métricas principales */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {/* Órdenes Activas */}
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-900">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                    Órdenes Activas
                                </p>
                                <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                                    {stats.activeOrders}
                                </p>
                            </div>
                            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                                <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <Package className="mr-1 h-4 w-4 text-neutral-500" />
                            <span className="text-neutral-600 dark:text-neutral-400">
                                {stats.productsInRental} productos en alquiler
                            </span>
                        </div>
                    </div>

                    {/* Facturas Pendientes */}
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-900">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                    Facturación Pendiente
                                </p>
                                <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                                    {stats.pendingBills}
                                </p>
                            </div>
                            <div className="rounded-lg bg-amber-100 p-3 dark:bg-amber-900/30">
                                <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                            Movimientos sin facturar
                        </div>
                    </div>

                    {/* Ingresos Totales */}
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-900">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                    Ingresos Totales
                                </p>
                                <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                                    {formatCurrency(stats.totalRevenue)}
                                </p>
                            </div>
                            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <TrendingUp className="mr-1 h-4 w-4 text-green-600" />
                            <span className="text-neutral-600 dark:text-neutral-400">
                                Total facturado
                            </span>
                        </div>
                    </div>
                </div>

                {/* Sección principal con tablas */}
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-white md:min-h-min dark:border-sidebar-border dark:bg-neutral-900">
                    <div className="grid gap-6 p-6 md:grid-cols-2">
                        {/* Órdenes Recientes */}
                        <div>
                            <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                                Órdenes Recientes
                            </h3>
                            <div className="space-y-3">
                                {recentOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                                                    {order.code}
                                                </p>
                                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                    {order.client_name}
                                                </p>
                                            </div>
                                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                {order.last_state}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-xs text-neutral-500">
                                            Desde: {new Date(order.date_from).toLocaleDateString('es-AR')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Productos Más Alquilados */}
                        <div>
                            <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                                Productos Más Utilizados
                            </h3>
                            <div className="space-y-3">
                                {topProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                                                    {product.name}
                                                </p>
                                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                    {formatCurrency(product.current_cost)}/día
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                                    {product.stock_in_rental} en alquiler
                                                </p>
                                                <p className="text-xs text-neutral-500">
                                                    {product.available_stock} disponibles
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                                                <div
                                                    className="h-full rounded-full bg-blue-600"
                                                    style={{
                                                        width: `${(product.stock_in_rental / (product.stock_in_rental + product.available_stock)) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Estadísticas adicionales */}
                    <div className="border-t border-neutral-200 px-6 py-4 dark:border-neutral-800">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="flex items-center space-x-3">
                                <Users className="h-5 w-5 text-neutral-500" />
                                <div>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                        Total Clientes
                                    </p>
                                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                                        {stats.totalClients}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                                <div>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                        Stock Bajo
                                    </p>
                                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                                        {stats.lowStockProducts} productos
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Package className="h-5 w-5 text-neutral-500" />
                                <div>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                        Productos en Alquiler
                                    </p>
                                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                                        {stats.productsInRental} unidades
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}