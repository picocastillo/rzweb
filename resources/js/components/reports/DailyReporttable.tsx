import { Badge } from '@/components/ui/badge';
import { getStatusVariant } from '@/utils/order-utils';
import { Link } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';

type DailyMovement = {
    id: number;
    created_at: string;
    qty: number;
    product: {
        id: number;
        name: string;
        code?: string; // Código corto del producto (Ba, Vc, etc)
    };
    order: {
        id: number;
        code: string;
        address: string;
        name_last_state: string;
        client: {
            id: number;
            name: string;
        };
    } | null;
};

type GroupedMovement = {
    order_id: number;
    order_code: string;
    address: string;
    client_name: string;
    status: string;
    products: {
        [productCode: string]: number; // product_code => quantity
    };
};

type Props = {
    movements: DailyMovement[];
    title: string;
};

export function DailyReportTable({ movements, title }: Props) {
    // Obtener todos los códigos de productos únicos
    const productCodes = Array.from(
        new Set(
            movements
                .map((m) => m.product.code || getProductCode(m.product.name))
                .filter(Boolean),
        ),
    ).sort();

    // Agrupar movimientos por dirección/orden
    const groupedData = groupMovementsByAddress(movements);

    return (
        <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                        <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:bg-gray-900 dark:text-gray-300">
                            # Orden
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                            Dirección
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                            Cliente
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                            Estado
                        </th>

                        {/* Columna para cada producto */}
                        {productCodes.map((code) => (
                            <th
                                key={code}
                                className="bg-blue-50 px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase dark:bg-blue-950 dark:text-gray-300"
                            >
                                {code}
                            </th>
                        ))}

                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase dark:text-gray-300">
                            Total
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
                    {groupedData.length > 0 ? (
                        groupedData.map((row, idx) => {
                            const totalQty = Object.values(row.products).reduce(
                                (sum, qty) => sum + qty,
                                0,
                            );

                            return (
                                <tr
                                    key={idx}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-900"
                                >
                                    <td className="sticky left-0 bg-white px-4 py-3 text-sm dark:bg-gray-950">
                                        <Link
                                            href={`/orders/${row.order_id}`}
                                            className="group inline-flex items-center gap-1 font-medium text-primary hover:underline"
                                        >
                                            {row.order_code}
                                            <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {row.address}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {row.client_name}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            variant={getStatusVariant(
                                                row.status,
                                            )}
                                        >
                                            {row.status}
                                        </Badge>
                                    </td>

                                    {/* Cantidad por cada producto */}
                                    {productCodes.map((code) => (
                                        <td
                                            key={code}
                                            className="bg-blue-50/50 px-4 py-3 text-center text-sm font-medium dark:bg-blue-950/50"
                                        >
                                            {row.products[code] || '-'}
                                        </td>
                                    ))}

                                    <td className="px-4 py-3 text-center text-sm font-bold">
                                        {totalQty}
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td
                                colSpan={productCodes.length + 5}
                                className="px-4 py-8 text-center text-gray-500"
                            >
                                {title === 'Instalaciones'
                                    ? 'No hay instalaciones para esta fecha'
                                    : 'No hay retiros para esta fecha'}
                            </td>
                        </tr>
                    )}
                </tbody>

                {/* Fila de totales */}
                {groupedData.length > 0 && (
                    <tfoot className="bg-gray-100 font-bold dark:bg-gray-800">
                        <tr>
                            <td
                                colSpan={4}
                                className="px-4 py-3 text-right text-sm uppercase"
                            >
                                Total:
                            </td>
                            {productCodes.map((code) => {
                                const total = groupedData.reduce(
                                    (sum, row) =>
                                        sum + (row.products[code] || 0),
                                    0,
                                );
                                return (
                                    <td
                                        key={code}
                                        className="bg-blue-100 px-4 py-3 text-center text-sm dark:bg-blue-900"
                                    >
                                        {total || '-'}
                                    </td>
                                );
                            })}
                            <td className="px-4 py-3 text-center text-sm">
                                {groupedData.reduce(
                                    (sum, row) =>
                                        sum +
                                        Object.values(row.products).reduce(
                                            (s, q) => s + q,
                                            0,
                                        ),
                                    0,
                                )}
                            </td>
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    );
}

// Función para agrupar movimientos por orden/dirección
function groupMovementsByAddress(
    movements: DailyMovement[],
): GroupedMovement[] {
    const grouped = new Map<number, GroupedMovement>();

    movements.forEach((movement) => {
        if (!movement.order) return;

        const orderId = movement.order.id;

        if (!grouped.has(orderId)) {
            grouped.set(orderId, {
                order_id: orderId,
                order_code: movement.order.code,
                address: movement.order.address,
                client_name: movement.order.client.name,
                status: movement.order.name_last_state,
                products: {},
            });
        }

        const group = grouped.get(orderId)!;
        const productCode =
            movement.product.code || getProductCode(movement.product.name);

        if (productCode) {
            group.products[productCode] =
                (group.products[productCode] || 0) + movement.qty;
        }
    });

    return Array.from(grouped.values());
}

function capitalizeFirst(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Función para obtener código corto del producto basado en su nombre
function getProductCode(productName: string): string {
    const codes: Record<string, string> = {
        baliza: 'Ba',
        balizas: 'Ba',
        'vallas cortas': 'Vc',
        'valla corta': 'Vc',
        'vallas largas': 'Vl',
        'valla larga': 'Vl',
        carteles: 'Ca',
        cartel: 'Ca',
    };

    const name = productName.toLowerCase().trim();

    for (const [key, code] of Object.entries(codes)) {
        if (name.includes(key)) {
            return code;
        }
    }

    return capitalizeFirst(productName).substring(0, 2);
}
