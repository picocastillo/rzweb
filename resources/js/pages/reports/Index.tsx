import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { calculateRentalDays, getStatusVariant } from '@/utils/order-utils';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, ExternalLink, List, Search } from 'lucide-react';
import { useState } from 'react';

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
    code: string;
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
    created_at?: string;
};

type DailyMovement = {
    id: number;
    created_at: string;
    qty: number;
    product: Product;
    order: Order | null;
};

type OrderStateOption = {
    value: string;
    label: string;
};

type Props = {
    movements?: {
        data: StockMovement[];
    };
    installations?: DailyMovement[];
    removals?: DailyMovement[];
    clients: Client[];
    orderStates?: OrderStateOption[];
    viewType: 'general' | 'daily';
    filters: {
        client_id?: string;
        status?: string;
        start_date?: string;
        end_date?: string;
        address?: string;
        daily_date?: string;
    };
};

const COLUMNS = {
    order_id: { label: '# Orden', defaultVisible: true },
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

const DAILY_COLUMNS = {
    time: { label: 'Hora', defaultVisible: true },
    order_id: { label: '# Orden', defaultVisible: true },
    product: { label: 'Producto', defaultVisible: true },
    quantity: { label: 'Cant', defaultVisible: true },
    client: { label: 'Cliente', defaultVisible: true },
    address: { label: 'Dirección', defaultVisible: true },
    status: { label: 'Estado', defaultVisible: true },
};

export default function Index({
    movements,
    installations,
    removals,
    clients,
    orderStates,
    viewType,
    filters,
}: Props) {
    const [currentViewType, setCurrentViewType] = useState<'general' | 'daily'>(
        viewType,
    );

    // Estados para vista general
    const [selectedClient, setSelectedClient] = useState<string>(
        filters.client_id || '',
    );
    const [selectedStatus, setSelectedStatus] = useState<string>(
        filters.status || '',
    );
    const [startDate, setStartDate] = useState<string>(
        filters.start_date || '',
    );
    const [addressSearch, setAddressSearch] = useState<string>(
        filters.address || '',
    );
    const [visibleColumns, setVisibleColumns] = useState<
        Record<string, boolean>
    >(
        Object.keys(COLUMNS).reduce(
            (acc, key) => {
                acc[key] = COLUMNS[key as keyof typeof COLUMNS].defaultVisible;
                return acc;
            },
            {} as Record<string, boolean>,
        ),
    );

    // Estados para vista diaria
    const [dailyDate, setDailyDate] = useState<string>(
        filters.daily_date || new Date().toISOString().split('T')[0],
    );
    const [dailyClient, setDailyClient] = useState<string>(
        filters.client_id || '',
    );
    const [visibleDailyColumns, setVisibleDailyColumns] = useState<
        Record<string, boolean>
    >(
        Object.keys(DAILY_COLUMNS).reduce(
            (acc, key) => {
                acc[key] =
                    DAILY_COLUMNS[
                        key as keyof typeof DAILY_COLUMNS
                    ].defaultVisible;
                return acc;
            },
            {} as Record<string, boolean>,
        ),
    );

    const formatDate = (date?: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('es-AR');
    };

    const formatTime = (datetime?: string) => {
        if (!datetime) return '-';
        return new Date(datetime).toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleGeneralFilter = () => {
        router.get(
            '/reports',
            {
                view_type: 'general',
                client_id: selectedClient || undefined,
                status: selectedStatus || undefined,
                start_date: startDate || undefined,
                address: addressSearch || undefined,
            },
            { preserveState: true },
        );
    };

    const handleDailyFilter = () => {
        router.get(
            '/reports',
            {
                view_type: 'daily',
                daily_date: dailyDate,
                client_id: dailyClient || undefined,
            },
            { preserveState: true },
        );
    };

    const toggleColumn = (columnKey: string) => {
        setVisibleColumns((prev) => ({
            ...prev,
            [columnKey]: !prev[columnKey],
        }));
    };

    const toggleDailyColumn = (columnKey: string) => {
        setVisibleDailyColumns((prev) => ({
            ...prev,
            [columnKey]: !prev[columnKey],
        }));
    };

    const switchViewType = (type: 'general' | 'daily') => {
        setCurrentViewType(type);
        router.get('/reports', { view_type: type }, { preserveState: false });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Informes', href: '/reports' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Informes" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold dark:text-white">
                        Informes
                    </h1>

                    {/* Toggle entre vistas */}
                    <div className="flex gap-2">
                        <Button
                            variant={
                                currentViewType === 'general'
                                    ? 'default'
                                    : 'outline'
                            }
                            onClick={() => switchViewType('general')}
                        >
                            <List className="mr-2 h-4 w-4" />
                            Vista General
                        </Button>
                        <Button
                            variant={
                                currentViewType === 'daily'
                                    ? 'default'
                                    : 'outline'
                            }
                            onClick={() => switchViewType('daily')}
                        >
                            <Calendar className="mr-2 h-4 w-4" />
                            Vista Diaria
                        </Button>
                    </div>
                </div>

                {/* VISTA GENERAL */}
                {currentViewType === 'general' && (
                    <>
                        {/* Filtros vista general */}
                        <div className="mb-2 grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Fecha Inicio
                                </Label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Dirección
                                </Label>
                                <input
                                    type="text"
                                    value={addressSearch}
                                    onChange={(e) =>
                                        setAddressSearch(e.target.value)
                                    }
                                    placeholder="Buscar dirección"
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>
                        </div>

                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Cliente
                                </Label>
                                <Select
                                    value={selectedClient}
                                    onValueChange={setSelectedClient}
                                >
                                    <SelectTrigger className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
                                        <SelectValue placeholder="Seleccionar cliente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Todos los clientes
                                        </SelectItem>
                                        {clients.map((client) => (
                                            <SelectItem
                                                key={client.id}
                                                value={client.id.toString()}
                                            >
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
                                <Select
                                    value={selectedStatus}
                                    onValueChange={setSelectedStatus}
                                >
                                    <SelectTrigger className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
                                        <SelectValue placeholder="Seleccionar estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Todos los estados
                                        </SelectItem>
                                        {orderStates?.map((state) => (
                                            <SelectItem
                                                key={state.value}
                                                value={state.value}
                                            >
                                                {state.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    onClick={handleGeneralFilter}
                                    className="mt-2"
                                >
                                    <Search className="mr-2 h-4 w-4" />
                                    Buscar
                                </Button>
                            </div>
                        </div>

                        <div className="mb-4 flex flex-wrap gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        Columnas Visibles
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="start"
                                    className="w-56"
                                >
                                    {Object.entries(COLUMNS).map(
                                        ([key, column]) => (
                                            <DropdownMenuCheckboxItem
                                                key={key}
                                                checked={visibleColumns[key]}
                                                onCheckedChange={() =>
                                                    toggleColumn(key)
                                                }
                                            >
                                                {column.label}
                                            </DropdownMenuCheckboxItem>
                                        ),
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Tabla vista general */}
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        {visibleColumns.order_id && (
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                                                # Orden
                                            </th>
                                        )}
                                        {visibleColumns.product && (
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                                                Producto
                                            </th>
                                        )}
                                        {visibleColumns.price && (
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                                                Precio
                                            </th>
                                        )}
                                        {visibleColumns.quantity && (
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                                                Cant
                                            </th>
                                        )}
                                        {visibleColumns.status && (
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                                                Estado
                                            </th>
                                        )}
                                        {visibleColumns.client && (
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                                                Cliente
                                            </th>
                                        )}
                                        {visibleColumns.address && (
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                                                Dirección
                                            </th>
                                        )}
                                        {visibleColumns.date_from && (
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                                                Instalación
                                            </th>
                                        )}
                                        {visibleColumns.date_to && (
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                                                Retiro
                                            </th>
                                        )}
                                        {visibleColumns.days && (
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                                                # Días
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
                                    {movements && movements.data.length > 0 ? (
                                        movements.data.map((movement) => (
                                            <tr
                                                key={movement.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-900"
                                            >
                                                {visibleColumns.order_id && (
                                                    <td className="px-4 py-3 text-sm">
                                                        {movement.order
                                                            ?.code ? (
                                                            <Link
                                                                href={`/orders/${movement.order.id}`}
                                                                className="group inline-flex items-center gap-1 font-medium text-primary hover:underline"
                                                            >
                                                                {
                                                                    movement
                                                                        .order
                                                                        .code
                                                                }
                                                                <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                                                            </Link>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </td>
                                                )}
                                                {visibleColumns.product && (
                                                    <td className="px-4 py-3 text-sm">
                                                        {movement.product.name}
                                                    </td>
                                                )}
                                                {visibleColumns.price && (
                                                    <td className="px-4 py-3 text-sm">
                                                        {movement.product
                                                            .current_cost
                                                            ? `$ ${movement.product.current_cost.toFixed(2)}`
                                                            : '-'}
                                                    </td>
                                                )}
                                                {visibleColumns.quantity && (
                                                    <td className="px-4 py-3 text-center text-sm">
                                                        {movement.qty}
                                                    </td>
                                                )}
                                                {visibleColumns.status && (
                                                    <td className="px-4 py-3">
                                                        {movement.order ? (
                                                            <Badge
                                                                variant={getStatusVariant(
                                                                    movement
                                                                        .order
                                                                        .name_last_state,
                                                                )}
                                                            >
                                                                {
                                                                    movement
                                                                        .order
                                                                        .name_last_state
                                                                }
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">
                                                                Sin orden
                                                            </span>
                                                        )}
                                                    </td>
                                                )}
                                                {visibleColumns.client && (
                                                    <td className="px-4 py-3 text-sm">
                                                        {movement.order?.client
                                                            ?.name || '-'}
                                                    </td>
                                                )}
                                                {visibleColumns.address && (
                                                    <td className="px-4 py-3 text-sm">
                                                        {movement.order
                                                            ?.address || '-'}
                                                    </td>
                                                )}
                                                {visibleColumns.date_from && (
                                                    <td className="px-4 py-3 text-sm">
                                                        {formatDate(
                                                            movement.order
                                                                ?.date_from,
                                                        )}
                                                    </td>
                                                )}
                                                {visibleColumns.date_to && (
                                                    <td className="px-4 py-3 text-sm">
                                                        {formatDate(
                                                            movement.order
                                                                ?.date_to,
                                                        )}
                                                    </td>
                                                )}
                                                {visibleColumns.days && (
                                                    <td className="px-4 py-3 text-center text-sm">
                                                        {movement.order
                                                            ?.date_from &&
                                                        movement.order?.date_to
                                                            ? calculateRentalDays(
                                                                  movement.order
                                                                      .date_from,
                                                                  movement.order
                                                                      .date_to,
                                                              )
                                                            : '-'}
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={
                                                    Object.values(
                                                        visibleColumns,
                                                    ).filter(Boolean).length
                                                }
                                                className="px-4 py-8 text-center text-gray-500"
                                            >
                                                No hay movimientos para mostrar
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* VISTA DIARIA */}
                {currentViewType === 'daily' && (
                    <>
                        {/* Filtros vista diaria */}
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Fecha
                                </Label>
                                <input
                                    type="date"
                                    value={dailyDate}
                                    onChange={(e) =>
                                        setDailyDate(e.target.value)
                                    }
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Cliente
                                </Label>
                                <Select
                                    value={dailyClient}
                                    onValueChange={setDailyClient}
                                >
                                    <SelectTrigger className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
                                        <SelectValue placeholder="Todos los clientes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Todos los clientes
                                        </SelectItem>
                                        {clients.map((client) => (
                                            <SelectItem
                                                key={client.id}
                                                value={client.id.toString()}
                                            >
                                                {client.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    onClick={handleDailyFilter}
                                    className="mt-2"
                                >
                                    <Search className="mr-2 h-4 w-4" />
                                    Buscar
                                </Button>
                            </div>
                        </div>

                        <div className="mb-4 flex flex-wrap gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        Columnas Visibles
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="start"
                                    className="w-56"
                                >
                                    {Object.entries(DAILY_COLUMNS).map(
                                        ([key, column]) => (
                                            <DropdownMenuCheckboxItem
                                                key={key}
                                                checked={
                                                    visibleDailyColumns[key]
                                                }
                                                onCheckedChange={() =>
                                                    toggleDailyColumn(key)
                                                }
                                            >
                                                {column.label}
                                            </DropdownMenuCheckboxItem>
                                        ),
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Tabs para Instalaciones y Retiros */}
                        <Tabs defaultValue="installations" className="w-full">
                            <TabsList className="mb-4">
                                <TabsTrigger value="installations">
                                    Instalaciones ({installations?.length || 0})
                                </TabsTrigger>
                                <TabsTrigger value="removals">
                                    Retiros ({removals?.length || 0})
                                </TabsTrigger>
                            </TabsList>

                            {/* Tabla de Instalaciones */}
                            <TabsContent value="installations">
                                <div className="overflow-x-auto rounded-lg border">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                                        <thead className="bg-gray-50 dark:bg-gray-900">
                                            <tr>
                                                {visibleDailyColumns.order_id && (
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                                                        # Orden
                                                    </th>
                                                )}
                                                {visibleDailyColumns.product && (
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                                                        Producto
                                                    </th>
                                                )}
                                                {visibleDailyColumns.quantity && (
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                                                        Cant
                                                    </th>
                                                )}
                                                {visibleDailyColumns.client && (
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                                                        Cliente
                                                    </th>
                                                )}
                                                {visibleDailyColumns.address && (
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                                                        Dirección
                                                    </th>
                                                )}
                                                {visibleDailyColumns.status && (
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                                                        Estado
                                                    </th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
                                            {installations &&
                                            installations.length > 0 ? (
                                                installations.map(
                                                    (movement) => (
                                                        <tr
                                                            key={movement.id}
                                                            className="hover:bg-gray-50 dark:hover:bg-gray-900"
                                                        >
                                                            {visibleDailyColumns.order_id && (
                                                                <td className="px-4 py-3 text-sm">
                                                                    {movement
                                                                        .order
                                                                        ?.code ? (
                                                                        <Link
                                                                            href={`/orders/${movement.order.id}`}
                                                                            className="group inline-flex items-center gap-1 font-medium text-primary hover:underline"
                                                                        >
                                                                            {
                                                                                movement
                                                                                    .order
                                                                                    .code
                                                                            }
                                                                            <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                                                                        </Link>
                                                                    ) : (
                                                                        '-'
                                                                    )}
                                                                </td>
                                                            )}
                                                            {visibleDailyColumns.product && (
                                                                <td className="px-4 py-3 text-sm">
                                                                    {
                                                                        movement
                                                                            .product
                                                                            .name
                                                                    }
                                                                </td>
                                                            )}
                                                            {visibleDailyColumns.quantity && (
                                                                <td className="px-4 py-3 text-center text-sm">
                                                                    {
                                                                        movement.qty
                                                                    }
                                                                </td>
                                                            )}
                                                            {visibleDailyColumns.client && (
                                                                <td className="px-4 py-3 text-sm">
                                                                    {movement
                                                                        .order
                                                                        ?.client
                                                                        ?.name ||
                                                                        '-'}
                                                                </td>
                                                            )}
                                                            {visibleDailyColumns.address && (
                                                                <td className="px-4 py-3 text-sm">
                                                                    {movement
                                                                        .order
                                                                        ?.address ||
                                                                        '-'}
                                                                </td>
                                                            )}
                                                            {visibleDailyColumns.status && (
                                                                <td className="px-4 py-3">
                                                                    {movement.order ? (
                                                                        <Badge
                                                                            variant={getStatusVariant(
                                                                                movement
                                                                                    .order
                                                                                    .name_last_state,
                                                                            )}
                                                                        >
                                                                            {
                                                                                movement
                                                                                    .order
                                                                                    .name_last_state
                                                                            }
                                                                        </Badge>
                                                                    ) : (
                                                                        <span className="text-xs text-gray-400">
                                                                            -
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ),
                                                )
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={
                                                            Object.values(
                                                                visibleDailyColumns,
                                                            ).filter(Boolean)
                                                                .length
                                                        }
                                                        className="px-4 py-8 text-center text-gray-500"
                                                    >
                                                        No hay instalaciones
                                                        para esta fecha
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </TabsContent>

                            {/* Tabla de Retiros */}
                            <TabsContent value="removals">
                                <div className="overflow-x-auto rounded-lg border">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                                        <thead className="bg-gray-50 dark:bg-gray-900">
                                            <tr>
                                                {visibleDailyColumns.time && (
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                                                        Hora
                                                    </th>
                                                )}
                                                {visibleDailyColumns.order_id && (
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                                                        # Orden
                                                    </th>
                                                )}
                                                {visibleDailyColumns.product && (
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                                                        Producto
                                                    </th>
                                                )}
                                                {visibleDailyColumns.quantity && (
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                                                        Cant
                                                    </th>
                                                )}
                                                {visibleDailyColumns.client && (
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                                                        Cliente
                                                    </th>
                                                )}
                                                {visibleDailyColumns.address && (
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                                                        Dirección
                                                    </th>
                                                )}
                                                {visibleDailyColumns.status && (
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                                                        Estado
                                                    </th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
                                            {removals && removals.length > 0 ? (
                                                removals.map((movement) => (
                                                    <tr
                                                        key={movement.id}
                                                        className="hover:bg-gray-50 dark:hover:bg-gray-900"
                                                    >
                                                        {visibleDailyColumns.time && (
                                                            <td className="px-4 py-3 text-sm">
                                                                {formatTime(
                                                                    movement.created_at,
                                                                )}
                                                            </td>
                                                        )}
                                                        {visibleDailyColumns.order_id && (
                                                            <td className="px-4 py-3 text-sm">
                                                                {movement.order
                                                                    ?.id || '-'}
                                                            </td>
                                                        )}
                                                        {visibleDailyColumns.product && (
                                                            <td className="px-4 py-3 text-sm">
                                                                {
                                                                    movement
                                                                        .product
                                                                        .name
                                                                }
                                                            </td>
                                                        )}
                                                        {visibleDailyColumns.quantity && (
                                                            <td className="px-4 py-3 text-center text-sm">
                                                                {movement.qty}
                                                            </td>
                                                        )}
                                                        {visibleDailyColumns.client && (
                                                            <td className="px-4 py-3 text-sm">
                                                                {movement.order
                                                                    ?.client
                                                                    ?.name ||
                                                                    '-'}
                                                            </td>
                                                        )}
                                                        {visibleDailyColumns.address && (
                                                            <td className="px-4 py-3 text-sm">
                                                                {movement.order
                                                                    ?.address ||
                                                                    '-'}
                                                            </td>
                                                        )}
                                                        {visibleDailyColumns.status && (
                                                            <td className="px-4 py-3">
                                                                {movement.order ? (
                                                                    <Badge
                                                                        variant={getStatusVariant(
                                                                            movement
                                                                                .order
                                                                                .name_last_state,
                                                                        )}
                                                                    >
                                                                        {
                                                                            movement
                                                                                .order
                                                                                .name_last_state
                                                                        }
                                                                    </Badge>
                                                                ) : (
                                                                    <span className="text-xs text-gray-400">
                                                                        -
                                                                    </span>
                                                                )}
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={
                                                            Object.values(
                                                                visibleDailyColumns,
                                                            ).filter(Boolean)
                                                                .length
                                                        }
                                                        className="px-4 py-8 text-center text-gray-500"
                                                    >
                                                        No hay retiros para esta
                                                        fecha
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
