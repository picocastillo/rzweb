import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { calculateRentalDays, getStatusVariant } from '@/utils/order-utils';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

type Client = {
    id: number;
    name: string;
};

type Order = {
    id: number;
    client_id: number;
    address: string;
    date_from: string;
    date_to: string;
    last_state: string | null;
    name_last_state: string;
    client: Client;
};

type Product = {
    id: number;
    name: string;
    current_cost?: number;
};

type StockMovement = {
    id: number;
    product: Product;
    qty: number;
    order?: Order;
};

type OrderStateOption = {
    value: string;
    label: string;
};

type Props = {
    movements: {
        data: StockMovement[];
    };
    clients: Client[];
    orderStates: OrderStateOption[];
};

// Define las columnas disponibles
const COLUMNS = {
    order_id: { label: '# Orden', defaultVisible: true },
    action: { label: 'Acción', defaultVisible: true },
    product: { label: 'Producto', defaultVisible: true },
    price: { label: 'Precio', defaultVisible: true },
    quantity: { label: 'Cant', defaultVisible: true },
    status: { label: 'Estado', defaultVisible: true },
    client: { label: 'Cliente', defaultVisible: true },
    address: { label: 'Dirección', defaultVisible: true },
    date_from: { label: 'Instalación', defaultVisible: true },
    date_to: { label: 'Retiro', defaultVisible: true },
    days: { label: '# Días', defaultVisible: true },
};

export default function Index({ movements, clients, orderStates }: Props) {
    const [selectedClient, setSelectedClient] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [addressSearch, setAddressSearch] = useState<string>('');

    // Estado para columnas visibles
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
        Object.keys(COLUMNS).reduce((acc, key) => {
            acc[key] = COLUMNS[key as keyof typeof COLUMNS].defaultVisible;
            return acc;
        }, {} as Record<string, boolean>)
    );

    const formatDate = (date?: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('es-AR');
    };

    const handleFilter = () => {
        router.get(
            '/reports',
            {
                client_id: selectedClient || undefined,
                status: selectedStatus || undefined,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
                address: addressSearch || undefined,
            },
            { preserveState: true }
        );
    };

    const toggleColumn = (columnKey: string) => {
        setVisibleColumns((prev) => ({
            ...prev,
            [columnKey]: !prev[columnKey],
        }));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Informes', href: '/reports' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Informes" />

            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6 dark:text-white">
                    Informes de Movimientos
                </h1>

                {/* Filtros */}
                <div className="mb-2 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Fecha Inicio
                        </Label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm"
                            placeholder="Seleccionar fecha"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Fecha Fin
                        </Label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm"
                            placeholder="Seleccionar fecha"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Dirección
                        </Label>
                        <input
                            type="text"
                            value={addressSearch}
                            onChange={(e) => setAddressSearch(e.target.value)}
                            placeholder="Buscar dirección"
                            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm"
                        />
                    </div>

                    <div />
                </div>

                <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Cliente
                        </Label>
                        <Select value={selectedClient} onValueChange={setSelectedClient}>
                            <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                                <SelectValue placeholder="Seleccionar cliente" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los clientes</SelectItem>
                                {clients.map((client) => (
                                    <SelectItem key={client.id} value={client.id.toString()}>
                                        {client.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Estado
                        </Label>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                                <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los estados</SelectItem>
                                {orderStates.map((state) => (
                                    <SelectItem key={state.value} value={state.value}>
                                        {state.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-end">
                        <Button onClick={handleFilter} className="mt-2">
                            <Search className="w-4 h-4 mr-2" />
                            Buscar
                        </Button>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="mb-4 flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm">
                        Mostrar 10 filas
                    </Button>

                    {/* Botón de Columnas Visibles con Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                Columnas Visibles
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                            {Object.entries(COLUMNS).map(([key, column]) => (
                                <DropdownMenuCheckboxItem
                                    key={key}
                                    checked={visibleColumns[key]}
                                    onCheckedChange={() => toggleColumn(key)}
                                >
                                    {column.label}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="outline" size="sm">
                        Copiar
                    </Button>
                    <Button variant="outline" size="sm">
                        EXCEL
                    </Button>
                    <Button variant="outline" size="sm">
                        IMPRIMIR
                    </Button>
                    <Button variant="outline" size="sm">
                        PDF
                    </Button>
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                {visibleColumns.order_id && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                                        # Orden
                                    </th>
                                )}
                                {visibleColumns.action && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                                        Acción
                                    </th>
                                )}
                                {visibleColumns.product && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                                        Producto
                                    </th>
                                )}
                                {visibleColumns.price && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                                        Precio
                                    </th>
                                )}
                                {visibleColumns.quantity && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                                        Cant
                                    </th>
                                )}
                                {visibleColumns.status && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                                        Estado
                                    </th>
                                )}
                                {visibleColumns.client && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                                        Cliente
                                    </th>
                                )}
                                {visibleColumns.address && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                                        Dirección
                                    </th>
                                )}
                                {visibleColumns.date_from && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                                        Instalación
                                    </th>
                                )}
                                {visibleColumns.date_to && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                                        Retiro
                                    </th>
                                )}
                                {visibleColumns.days && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                                        # Días
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-950">
                            {movements.data.length > 0 ? (
                                movements.data.map((movement) => (
                                    <tr
                                        key={movement.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-900"
                                    >
                                        {visibleColumns.order_id && (
                                            <td className="px-4 py-3 text-sm">
                                                {movement.order?.id || '-'}
                                            </td>
                                        )}
                                        {visibleColumns.action && (
                                            <td className="px-4 py-3">
                                                <Button
                                                    size="sm"
                                                    className="bg-cyan-500 hover:bg-cyan-600 text-xs"
                                                >
                                                    Acción ▼
                                                </Button>
                                            </td>
                                        )}
                                        {visibleColumns.product && (
                                            <td className="px-4 py-3 text-sm">
                                                {movement.product.name}
                                            </td>
                                        )}
                                        {visibleColumns.price && (
                                            <td className="px-4 py-3 text-sm">
                                                {movement.product.current_cost
                                                    ? `$ ${movement.product.current_cost.toFixed(2)}`
                                                    : '-'}
                                            </td>
                                        )}
                                        {visibleColumns.quantity && (
                                            <td className="px-4 py-3 text-sm text-center">
                                                {movement.qty}
                                            </td>
                                        )}
                                        {visibleColumns.status && (
                                            <td className="px-4 py-3">
                                                {movement.order ? (
                                                    <Badge variant={getStatusVariant(movement.order.name_last_state)}>
                                                        {movement.order.name_last_state}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">Sin orden</span>
                                                )}
                                            </td>
                                        )}
                                        {visibleColumns.client && (
                                            <td className="px-4 py-3 text-sm">
                                                {movement.order?.client?.name || '-'}
                                            </td>
                                        )}
                                        {visibleColumns.address && (
                                            <td className="px-4 py-3 text-sm">
                                                {movement.order?.address || '-'}
                                            </td>
                                        )}
                                        {visibleColumns.date_from && (
                                            <td className="px-4 py-3 text-sm">
                                                {formatDate(movement.order?.date_from)}
                                            </td>
                                        )}
                                        {visibleColumns.date_to && (
                                            <td className="px-4 py-3 text-sm">
                                                {formatDate(movement.order?.date_to)}
                                            </td>
                                        )}
                                        {visibleColumns.days && (
                                            <td className="px-4 py-3 text-sm text-center">
                                                {movement.order?.date_from && movement.order?.date_to
                                                    ? calculateRentalDays(
                                                        movement.order.date_from,
                                                        movement.order.date_to
                                                    )
                                                    : '-'}
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={Object.values(visibleColumns).filter(Boolean).length}
                                        className="px-4 py-8 text-center text-gray-500"
                                    >
                                        No hay movimientos para mostrar
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}