import { Order, Product } from '@/types/order';
import { useForm } from '@inertiajs/react';
import React, { useEffect, useMemo } from 'react';

function getLocalDateString(date: Date = new Date()): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

const MOVEMENT_TYPES = [
    { id: 0, name: 'Regreso por Orden (Devolución)' }, // Entrada de stock
    { id: 2, name: 'Salida por Orden (Entrega)' }, // Salida de stock
];

interface StockMovementModalProps {
    order: Order;
    products: Product[];
    allProducts?: Product[];
    showModal: boolean;
    onClose: () => void;
}

export default function StockMovementModal({
    order,
    products,
    allProducts,
    showModal,
    onClose,
}: StockMovementModalProps) {
    const { data, setData, post, errors, reset } = useForm<{
        product_id: string;
        qty: string;
        general: string;
        type: number;
        movement_date: string;
    }>({
        product_id: '',
        qty: '',
        general: '',
        type: MOVEMENT_TYPES[0].id, // Default a 0 (Regreso/Entrada)
        movement_date: getLocalDateString(),
    });

    useEffect(() => {
        if (showModal) {
            setData('movement_date', getLocalDateString());
        }
    }, [showModal, setData]);

    // Funcion para manejar el cambio de tipo y resetear el producto seleccionado
    const handleTypeChange = (newType: number) => {
        setData((prev) => ({
            ...prev,
            type: newType,
            product_id: '',
        }));
    };

    // Lógica para filtrar los productos disponibles en el select (Memorizado)
    const filteredProducts = useMemo(() => {
        // Si es Regreso por Orden:
        if (data.type === 0) {
            const orderProductIds = Array.from(
                new Set(order.stock_movements.map((sm) => sm.product_id)),
            );

            return products.filter((p) => orderProductIds.includes(p.id));
        }

        // Si es Salida por Orden:
        if (data.type === 2) {
            return allProducts;
        }

        return [];
    }, [data.type, products, allProducts, order.stock_movements]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(`/orders/${order.id}/stock-movement`, {
            onSuccess: () => {
                reset({
                    product_id: '',
                    qty: '',
                    general: '',
                    type: MOVEMENT_TYPES[0].id,
                    movement_date: getLocalDateString(),
                });
                onClose();
            },
        });
    };

    if (!showModal) return null;

    return (
        <div className="bg-opacity-50 dark:bg-opacity-70 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
            <div className="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800">
                <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Agregar Movimiento de Stock para Orden {order.code}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Puedes agregar(Entrega) o quitar(Devolución) productos
                        de la orden
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 p-6">
                        {errors.general && (
                            <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                                {errors.general}
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="movement_date"
                                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Fecha del movimiento
                            </label>
                            <input
                                type="date"
                                id="movement_date"
                                name="movement_date"
                                value={data.movement_date}
                                onChange={(e) =>
                                    setData('movement_date', e.target.value)
                                }
                                className={`w-full rounded-lg border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white ${
                                    errors.movement_date
                                        ? 'border-red-300 dark:border-red-500'
                                        : 'border-gray-300 dark:border-gray-600'
                                }`}
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Por defecto se usa el día de hoy; puedes
                                cambiarla si el movimiento ocurrió en otra
                                fecha.
                            </p>
                            {errors.movement_date && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                    {errors.movement_date}
                                </p>
                            )}
                        </div>

                        {/* Campo Tipo de Movimiento */}
                        <div>
                            <label
                                htmlFor="type"
                                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                {' '}
                                Tipo de Movimiento *{' '}
                            </label>
                            <select
                                id="type"
                                value={data.type}
                                onChange={(e) =>
                                    handleTypeChange(Number(e.target.value))
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                required
                            >
                                {MOVEMENT_TYPES.map((type) => (
                                    <option
                                        key={type.id}
                                        value={type.id}
                                        className="dark:text-white"
                                    >
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Campo Producto */}
                        <div>
                            <label
                                htmlFor="product_id"
                                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                {' '}
                                Producto *{' '}
                            </label>
                            <select
                                id="product_id"
                                name="product_id"
                                value={data.product_id}
                                onChange={(e) =>
                                    setData('product_id', e.target.value)
                                }
                                className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white ${
                                    errors.product_id
                                        ? 'border-red-300 dark:border-red-500'
                                        : 'border-gray-300 dark:border-gray-600'
                                }`}
                                required
                                disabled={filteredProducts?.length === 0}
                            >
                                <option value="" className="dark:text-gray-400">
                                    Seleccionar producto
                                </option>
                                {filteredProducts?.map((product) => (
                                    <option
                                        key={product.id}
                                        value={product.id}
                                        className="dark:text-white"
                                    >
                                        {product.name} (Stock:{' '}
                                        {product.current_stock})
                                    </option>
                                ))}
                            </select>

                            {/* mensaje si no hay productos disponibles o filtrados */}
                            {filteredProducts?.length === 0 && (
                                <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
                                    No hay productos disponibles para este tipo
                                    de movimiento (
                                    {
                                        MOVEMENT_TYPES.find(
                                            (t) => t.id === data.type,
                                        )?.name
                                    }
                                    ).
                                </p>
                            )}

                            {errors.product_id && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                    {errors.product_id}
                                </p>
                            )}
                        </div>

                        {/* Campo Cantidad */}
                        <div>
                            <label
                                htmlFor="qty"
                                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                {' '}
                                Cantidad *{' '}
                            </label>
                            <input
                                type="number"
                                id="qty"
                                name="qty"
                                min="1"
                                value={data.qty}
                                onChange={(e) => setData('qty', e.target.value)}
                                className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white ${
                                    errors.qty
                                        ? 'border-red-300 dark:border-red-500'
                                        : 'border-gray-300 dark:border-gray-600'
                                }`}
                                placeholder="Ingrese la cantidad"
                                required
                            />
                            {errors.qty && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                    {errors.qty}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Footer del Modal */}
                    <div className="flex justify-end space-x-3 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-700">
                        <button
                            type="button"
                            onClick={() => {
                                reset({
                                    product_id: '',
                                    qty: '',
                                    general: '',
                                    type: MOVEMENT_TYPES[0].id,
                                    movement_date: getLocalDateString(),
                                });
                                onClose();
                            }}
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                        >
                            {' '}
                            Cancelar{' '}
                        </button>
                        <button
                            type="submit"
                            disabled={
                                !data.product_id ||
                                filteredProducts?.length === 0
                            }
                            className="rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-600 dark:disabled:bg-gray-600"
                        >
                            {' '}
                            Agregar Movimiento{' '}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
