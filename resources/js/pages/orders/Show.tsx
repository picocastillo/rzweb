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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { OrderShowProps } from '@/types/order';
import {
    calculateRentalDays,
    formatDate,
    getStatusVariant,
} from '@/utils/order-utils';
import { useForm, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export default function Show() {
    const { order, products, allProducts, available_workers } = usePage()
        .props as unknown as OrderShowProps;
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [openStock, setOpenStock] = useState(true);
    const [openStates, setOpenStates] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const { auth } = usePage().props;
    const user = auth.user;
    const roleName = user.role_name;

    const assignForm = useForm({
        worker_id: '',
    }); 

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

    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     assignForm.post(`/orders/${order.id}/assign`, {
    //         onSuccess: () => {
    //             setShowAssignModal(false);
    //             assignForm.reset();
    //         },
    //     });
    // };

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
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-2 text-lg font-semibold text-gray-900">
                            Detalles
                        </h2>
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Información del cliente */}
                            <div className="rounded-lg bg-gray-50 p-4">
                                <h3 className="mb-2 font-semibold text-gray-900">
                                    Información del Cliente
                                </h3>
                                <p className="text-sm text-gray-500">Nombre</p>
                                <p className="text-black">
                                    {order.client.name}
                                </p>
                                <p className="mt-2 text-sm text-gray-500">
                                    Teléfono
                                </p>
                                <p className="text-black">
                                    {order.client.phone}
                                </p>
                            </div>

                            {/* Información del alquiler */}
                            <div className="rounded-lg bg-gray-50 p-4">
                                <h3 className="mb-2 font-semibold text-gray-900">
                                    Detalles del Alquiler
                                </h3>
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
                                <div className="mt-2 flex justify-between border-t border-gray-200 pt-2">
                                    <span className="text-sm text-gray-500">
                                        Duración:
                                    </span>
                                    <span className="text-black">
                                        {calculateRentalDays(
                                            order.date_from,
                                            order.date_to,
                                        )}{' '}
                                        días
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Collapsible
                            open={openStock}
                            onOpenChange={setOpenStock}
                        >
                            <div className="mb-2 flex items-center">
                                <h2 className="text-lg font-semibold text-gray-900">
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
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        onClick={() => setShowModal(true)}
                                        variant="success"
                                        size="sm"
                                    >
                                        Agregar Movimiento
                                    </Button>
                                </div>
                            </div>

                            <CollapsibleContent>
                                {order.stock_movements.length > 0 ? (
                                    <div className="overflow-hidden rounded-lg border border-gray-200">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Producto
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Cantidad
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Tipo
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Fecha
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {order.stock_movements.map(
                                                    (sm) => (
                                                        <tr
                                                            key={sm.id}
                                                            className="hover:bg-gray-50"
                                                        >
                                                            <td className="px-4 py-2 text-sm text-gray-900">
                                                                {
                                                                    sm.product
                                                                        .name
                                                                }
                                                            </td>
                                                            <td className="px-4 py-2 text-sm">
                                                                <span
                                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${sm.qty > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                                                >
                                                                    {sm.qty > 0
                                                                        ? '+'
                                                                        : ''}
                                                                    {sm.qty}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-gray-500">
                                                                {TYPE[sm.type]}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-gray-500">
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
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 py-8 text-center">
                                        <p className="text-sm text-gray-500">
                                            No hay movimientos de stock
                                            registrados.
                                        </p>
                                    </div>
                                )}
                            </CollapsibleContent>
                        </Collapsible>
                    </div>

                    {/* Card derecha: Estados */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        {roleName === 'Admin' && (
                        <>    
                            <div className="mb-2 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Trabajador
                                </h2>
                            </div>

                            {/* Trabajador asignado (puede cambiar) */}
                            <div className="mb-5 flex items-center justify-between rounded-md bg-gray-50 p-3">
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Trabajador asignado
                                    </p>
                                    <p className="font-medium text-gray-900">
                                        {order.name_assigned_to ?? 'Sin asignar'}
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    onClick={() => setShowAssignModal(true)}
                                    variant="info"
                                    size="sm"
                                >
                                    {order.assigned_to ? 'Reasignar' : 'Asignar'}
                                </Button>
                            </div>
                        </>
                        )}

                        {/* Estado actual resaltado */}
                        <Collapsible
                            open={openStates}
                            onOpenChange={setOpenStates}
                        >
                            <div className="mb-2 flex items-center">
                                <h2 className="text-lg font-semibold text-gray-900">
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
                                                            {state.name_state}
                                                        </Badge>
                                                        <span className="text-xs text-gray-500">
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
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Asignar trabajador</DialogTitle>
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
                                <label className="text-sm font-medium text-gray-700">
                                    Seleccionar trabajador
                                </label>

                                <Select
                                    value={
                                        assignForm.data.worker_id?.toString() ??
                                        ''
                                    }
                                    onValueChange={(value) =>
                                        assignForm.setData(
                                            'worker_id',
                                            Number(value),
                                        )
                                    }
                                >
                                    <SelectTrigger className="mt-1 w-full">
                                        <SelectValue placeholder="Elegir" />
                                    </SelectTrigger>

                                    {/* RADIX CONTENT – sin portal conflictivo */}
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>
                                                Trabajadores disponibles
                                            </SelectLabel>

                                            {available_workers?.map((w) => (
                                                <SelectItem
                                                    key={w.id}
                                                    value={String(w.id)}
                                                >
                                                    {w.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowAssignModal(false)}
                                >
                                    Cancelar
                                </Button>

                                <Button type="submit" variant="success">
                                    Asignar
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

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
