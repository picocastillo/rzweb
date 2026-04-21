import OrderFiles from '@/components/order/OrderFiles';
import OrderNotes from '@/components/order/OrderNotes';
import StockMovementModal from '@/components/order/StockMovementModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { OrderShowProps, StockMovement } from '@/types/order';
import {
    calculateRentalDays,
    formatDate,
    getStatusVariant,
} from '@/utils/order-utils';
import { useForm, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useMemo, useState } from 'react';

function getLocalDateInputValue(date = new Date()): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export default function Show() {
    const { order, products, allProducts, available_workers } = usePage()
        .props as unknown as OrderShowProps;
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showFinishModal, setShowFinishModal] = useState(false);
    const [openStock, setOpenStock] = useState(true);
    const [openStates, setOpenStates] = useState(true);
    const [openProductDays, setOpenProductDays] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const { auth } = usePage().props;
    const user = auth.user;
    const roleName = user.role_name;

    const assignForm = useForm({
        worker_id: '',
    });

    const finishForm = useForm({
        finish_date: getLocalDateInputValue(),
    });

    const { reset } = useForm({
        product_id: '',
        qty: '',
        general: '',
        type: '',
    });

    const isOrderFinished = order.name_last_state === 'Finalizada';
    const stockMovements = order.stock_movements;

    const productDaysRows = useMemo(() => {
        if (!isOrderFinished) {
            return [];
        }

        const groups = new Map<number, StockMovement[]>();
        for (const movement of stockMovements) {
            const existing = groups.get(movement.product_id);
            if (existing) {
                existing.push(movement);
            } else {
                groups.set(movement.product_id, [movement]);
            }
        }

        const rows: Array<{
            key: string;
            productId: number;
            productName: string;
            qty: number;
            fromDate: string;
            toDate: string;
            days: number;
        }> = [];

        for (const [productId, list] of groups) {
            const sorted = [...list].sort(
                (a, b) =>
                    new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime(),
            );
            const ingresos = sorted.filter((m) => Number(m.type) === 2);
            const egresos = sorted.filter((m) => Number(m.type) === 0);
            const pairs = Math.min(ingresos.length, egresos.length);

            for (let i = 0; i < pairs; i++) {
                const ing = ingresos[i];
                const egr = egresos[i];
                rows.push({
                    key: `${productId}-${ing.id}-${egr.id}`,
                    productId,
                    productName: ing.product?.name ?? '—',
                    qty: Math.abs(ing.qty),
                    fromDate: ing.created_at,
                    toDate: egr.created_at,
                    days: calculateRentalDays(ing.created_at, egr.created_at),
                });
            }
        }

        return rows;
    }, [isOrderFinished, stockMovements]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        {
            title: 'Órdenes',
            href: roleName === 'Admin' ? '/orders' : '/orders/worker',
        },
        { title: `Orden #${order.code}`, href: `/orders/${order.id}` },
    ];

    const handleStartOrder = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        assignForm.post(`/orders/${order.id}/start`, {
            onSuccess: () => {
                assignForm.reset();
            },
        });
    };

    const openFinishModal = () => {
        finishForm.setData('finish_date', getLocalDateInputValue());
        finishForm.clearErrors();
        setShowFinishModal(true);
    };

    const submitFinishOrder = (e: React.FormEvent) => {
        e.preventDefault();
        finishForm.post(`/orders/${order.id}/finish`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowFinishModal(false);
            },
        });
    };

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
            <div className="mx-auto max-w-7xl p-6">
                {/* Header de la orden */}
                <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 dark:border-gray-700 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Orden #{order.code}
                                </h1>
                                <div className="mt-3 flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-8 sm:gap-y-1 dark:text-gray-400">
                                    <p>
                                        <span className="font-medium text-gray-700 dark:text-gray-200">
                                            Creada el:{' '}
                                        </span>
                                        {order.created_at
                                            ? new Date(
                                                  order.created_at,
                                              ).toLocaleString('es-ES')
                                            : '—'}
                                    </p>
                                    <p>
                                        <span className="font-medium text-gray-700 dark:text-gray-200">
                                            Desde:{' '}
                                        </span>
                                        {formatDate(order.date_from)}
                                    </p>
                                    <p>
                                        <span className="font-medium text-gray-700 dark:text-gray-200">
                                            Hasta:{' '}
                                        </span>
                                        {formatDate(order.date_to)}
                                    </p>
                                    <p>
                                        <span className="font-medium text-gray-700 dark:text-gray-200">
                                            Días entre fechas:{' '}
                                        </span>
                                        {order.date_from && order.date_to
                                            ? `${calculateRentalDays(
                                                  order.date_from,
                                                  order.date_to,
                                              )} días`
                                            : '—'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Badge
                                    variant={getStatusVariant(
                                        order.name_last_state,
                                    )}
                                >
                                    {order.name_last_state}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contenido en dos columnas */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Card izquierda: Detalles y Movimientos */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        {/* Boton para iniciar orden (solo Trabajador) */}

                        <div className="mb-4">
                            {order.name_last_state === 'Asignada' && (
                                <Button
                                    type="button"
                                    onClick={handleStartOrder}
                                    variant="default"
                                >
                                    Iniciar Orden
                                </Button>
                            )}

                            {order.name_last_state === 'En curso' && (
                                <Button
                                    type="button"
                                    onClick={openFinishModal}
                                    variant="default"
                                >
                                    Finalizar Orden
                                </Button>
                            )}
                        </div>

                        <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                            Detalles
                        </h2>
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Información del cliente */}
                            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                                    Información del Cliente
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Nombre
                                </p>
                                <p className="text-black dark:text-white">
                                    {order.client.name}
                                </p>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    Teléfono
                                </p>
                                <p className="text-black dark:text-white">
                                    {order.client.phone
                                        ? order.client.phone
                                        : 'Sin definir'}
                                </p>
                            </div>

                            {/* Información del alquiler */}
                            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                                    Detalles del Alquiler
                                </h3>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Fecha de inicio:
                                    </span>
                                    <span className="text-black dark:text-white">
                                        {formatDate(order.date_from)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Fecha de fin:
                                    </span>
                                    <span className="text-black dark:text-white">
                                        {formatDate(order.date_to)}
                                    </span>
                                </div>
                                <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 dark:border-gray-600">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Días entre fechas:
                                    </span>
                                    <span className="text-black dark:text-white">
                                        {order.date_from && order.date_to
                                            ? `${calculateRentalDays(
                                                  order.date_from,
                                                  order.date_to,
                                              )} días`
                                            : '—'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Collapsible
                            open={openStock}
                            onOpenChange={setOpenStock}
                        >
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Movimientos de Stock
                                </h2>
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                        {openStock ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                    </Button>
                                </CollapsibleTrigger>
                                <Button
                                    type="button"
                                    onClick={() => setShowModal(true)}
                                    variant="success"
                                    size="sm"
                                    className="whitespace-normal sm:whitespace-nowrap"
                                    disabled={isOrderFinished}
                                    title={
                                        isOrderFinished
                                            ? 'La orden está finalizada'
                                            : undefined
                                    }
                                >
                                    Agregar/Quitar Producto
                                </Button>
                            </div>

                            {/* Aclaración debajo del group */}
                            {roleName === 'Trabajador' && (
                                <div className="mt-2 flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                                    <Info className="mt-[2px] h-4 w-4" />
                                    <span>
                                        Recuerda registrar cada movimiento, ya
                                        sea ingresando productos al alquiler o
                                        quitandolos.
                                    </span>
                                </div>
                            )}

                            <CollapsibleContent>
                                {order.stock_movements.length > 0 ? (
                                    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                                                        Producto
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                                                        Cantidad
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                                                        Tipo
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                                                        Fecha
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                                {order.stock_movements.map(
                                                    (sm) => (
                                                        <tr
                                                            key={sm.id}
                                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                                        >
                                                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                                                {
                                                                    sm.product
                                                                        .name
                                                                }
                                                            </td>
                                                            <td className="px-4 py-2 text-sm">
                                                                <span
                                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${sm.qty > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}
                                                                >
                                                                    {sm.qty > 0
                                                                        ? '+'
                                                                        : ''}
                                                                    {sm.qty}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                                                                {TYPE[sm.type]}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
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
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 py-8 text-center dark:border-gray-700 dark:bg-gray-700">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            No hay movimientos de stock
                                            registrados.
                                        </p>
                                    </div>
                                )}
                            </CollapsibleContent>
                        </Collapsible>

                        {isOrderFinished && (
                            <Collapsible
                                open={openProductDays}
                                onOpenChange={setOpenProductDays}
                                className="mt-6"
                            >
                                <div className="mb-2 flex items-center gap-2">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Días por producto
                                    </h2>
                                    <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            {openProductDays ? (
                                                <ChevronUp className="h-4 w-4" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </CollapsibleTrigger>
                                </div>

                                <CollapsibleContent>
                                    {productDaysRows.length > 0 ? (
                                        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead className="bg-gray-50 dark:bg-gray-700">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                                                            Producto
                                                        </th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                                                            Cantidad
                                                        </th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                                                            Ingreso
                                                        </th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                                                            Egreso
                                                        </th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">
                                                            Días
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                                    {productDaysRows.map(
                                                        (row) => (
                                                            <tr
                                                                key={row.key}
                                                                className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                                            >
                                                                <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                                                    {
                                                                        row.productName
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                                                    {row.qty}
                                                                </td>
                                                                <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                                                                    {new Date(
                                                                        row.fromDate,
                                                                    ).toLocaleString(
                                                                        'es-ES',
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                                                                    {new Date(
                                                                        row.toDate,
                                                                    ).toLocaleString(
                                                                        'es-ES',
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                                                    {row.days}{' '}
                                                                    {row.days ===
                                                                    1
                                                                        ? 'día'
                                                                        : 'días'}
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-gray-200 bg-gray-50 py-8 text-center dark:border-gray-700 dark:bg-gray-700">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                No hay productos con ingreso y
                                                egreso registrados.
                                            </p>
                                        </div>
                                    )}
                                </CollapsibleContent>
                            </Collapsible>
                        )}
                    </div>

                    {/* Card derecha: Estados */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        {roleName === 'Admin' && (
                            <>
                                <div className="mb-2 flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Trabajador
                                    </h2>
                                </div>

                                {/* Trabajador asignado (puede cambiar) */}
                                <div className="mb-5 flex items-center justify-between rounded-md bg-gray-50 p-3 dark:bg-gray-700">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Trabajador asignado
                                        </p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {order.name_assigned_to ??
                                                'Sin asignar'}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={() => setShowAssignModal(true)}
                                        variant="info"
                                        size="sm"
                                        disabled={isOrderFinished}
                                        title={
                                            isOrderFinished
                                                ? 'La orden está finalizada'
                                                : undefined
                                        }
                                    >
                                        {order.assigned_to
                                            ? 'Reasignar'
                                            : 'Asignar'}
                                    </Button>
                                </div>
                            </>
                        )}

                        {roleName === 'Admin' && (
                            <>
                                {/* Estado actual resaltado */}
                                <Collapsible
                                    open={openStates}
                                    onOpenChange={setOpenStates}
                                >
                                    <div className="mb-2 flex items-center gap-2">
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Estados
                                        </h2>
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                {openStates ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </CollapsibleTrigger>
                                    </div>

                                    <CollapsibleContent>
                                        {/* Línea de tiempo de estados (cronológica) */}
                                        <ul className="space-y-3">
                                            {[...order.states]
                                                .sort(
                                                    (a, b) =>
                                                        new Date(
                                                            a.created_at,
                                                        ).getTime() -
                                                        new Date(
                                                            b.created_at,
                                                        ).getTime(),
                                                )
                                                .map((state) => (
                                                    <li
                                                        key={state.id}
                                                        className="flex items-start gap-3"
                                                    >
                                                        {/* Punto de la línea de tiempo */}
                                                        <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500" />
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <Badge
                                                                    variant={getStatusVariant(
                                                                        state.name_state,
                                                                    )}
                                                                >
                                                                    {
                                                                        state.name_state
                                                                    }
                                                                </Badge>
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {new Date(
                                                                        state.created_at,
                                                                    ).toLocaleString(
                                                                        'es-ES',
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                        </ul>
                                    </CollapsibleContent>
                                </Collapsible>
                            </>
                        )}
                        <OrderFiles
                            orderId={order.id}
                            files={order.files || []}
                            canManagePrivate={true}
                        />
                    </div>

                    {/* NOTAS */}
                    <OrderNotes
                        orderId={order.id}
                        notes={order.notes || []}
                        canManagePrivate={true}
                    />
                </div>

                {/* Modales */}
                <Dialog
                    open={showAssignModal}
                    onOpenChange={setShowAssignModal}
                >
                    <DialogContent className="max-w-md border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                        <DialogHeader>
                            <DialogTitle className="text-gray-900 dark:text-white">
                                Asignar trabajador
                            </DialogTitle>
                        </DialogHeader>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                assignForm.post(`/orders/${order.id}/assign`, {
                                    onSuccess: () => {
                                        setShowAssignModal(false);
                                        assignForm.reset();
                                    },
                                });
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label
                                    htmlFor="worker_id"
                                    className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Seleccionar trabajador *
                                </label>

                                <select
                                    id="worker_id"
                                    name="worker_id"
                                    value={assignForm.data.worker_id ?? ''}
                                    onChange={(e) =>
                                        assignForm.setData(
                                            'worker_id',
                                            Number(e.target.value),
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    required
                                >
                                    <option value="">
                                        Seleccionar trabajador
                                    </option>

                                    {available_workers?.map((w) => (
                                        <option key={w.id} value={w.id}>
                                            {w.name}
                                        </option>
                                    ))}
                                </select>

                                {assignForm.errors.worker_id && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {assignForm.errors.worker_id}
                                    </p>
                                )}
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowAssignModal(false)}
                                >
                                    Cancelar
                                </Button>

                                <Button
                                    type="submit"
                                    variant="success"
                                    disabled={!assignForm.data.worker_id}
                                >
                                    Asignar
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={showFinishModal}
                    onOpenChange={setShowFinishModal}
                >
                    <DialogContent className="max-w-md border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                        <DialogHeader>
                            <DialogTitle className="text-gray-900 dark:text-white">
                                Finalizar orden
                            </DialogTitle>
                        </DialogHeader>

                        <form
                            onSubmit={submitFinishOrder}
                            className="space-y-4"
                        >
                            <div>
                                <label
                                    htmlFor="finish_date"
                                    className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Fecha de finalización *
                                </label>
                                <input
                                    id="finish_date"
                                    name="finish_date"
                                    type="date"
                                    value={finishForm.data.finish_date}
                                    onChange={(e) =>
                                        finishForm.setData(
                                            'finish_date',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                                {finishForm.errors.finish_date && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {finishForm.errors.finish_date}
                                    </p>
                                )}
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    Se registrarán movimientos de egreso (tipo
                                    0) para cada salida pendiente, con esta
                                    fecha.
                                </p>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowFinishModal(false)}
                                >
                                    Cancelar
                                </Button>

                                <Button
                                    type="submit"
                                    variant="default"
                                    disabled={finishForm.processing}
                                >
                                    Finalizar
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {showModal && (
                    <div className="bg-opacity-50 dark:bg-opacity-70 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
                        <div className="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800">
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
