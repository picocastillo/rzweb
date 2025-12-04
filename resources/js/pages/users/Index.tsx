import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Edit3, Eye, Plus, Trash2 } from 'lucide-react';

type Role = {
    id: number;
    name: string;
};

type User = {
    id: number | string;
    name: string;
    email?: string;
    role_name?: Role | null;
};

export default function UsersIndex({ users }: { users: User[]; role: Role }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Usuarios', href: '/users' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios" />

            <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Usuarios</h1>
                    <Button
                        variant="success"
                        onClick={() => router.visit('/users/create')}
                    >
                        <Plus size={18} /> Nuevo Usuario
                    </Button>
                </div>

                <div className="overflow-x-auto rounded-lg border">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nombre
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Rol
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-3">{user.name}</td>
                                    <td className="px-6 py-3">
                                        {user.role_name
                                            ? typeof user.role_name === 'string'
                                                ? user.role_name
                                                : user.role_name.name
                                            : '-'}
                                    </td>
                                    <td className="px-6 py-3">
                                        {user.email ?? '-'}
                                    </td>
                                    <td className="space-x-2 px-6 py-3">
                                        <Button
                                            onClick={() =>
                                                router.visit(
                                                    `/users/${user.id}`,
                                                )
                                            }
                                            variant={'default'}
                                        >
                                            <Eye size={16} />
                                        </Button>
                                        <Button
                                            onClick={() =>
                                                router.visit(
                                                    `/users/${user.id}/edit`,
                                                )
                                            }
                                            variant={'info'}
                                        >
                                            <Edit3 size={16} />
                                        </Button>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="destructive">
                                                    <Trash2 size={16} />
                                                </Button>
                                            </DialogTrigger>

                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>
                                                        Confirmar eliminación
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        ¿Eliminar usuario{' '}
                                                        <strong>
                                                            {user.name}
                                                        </strong>
                                                        ? Esta acción no se
                                                        puede deshacer.
                                                    </DialogDescription>
                                                </DialogHeader>

                                                <DialogFooter>
                                                    <DialogClose asChild>
                                                        <Button variant="outline">
                                                            Cancelar
                                                        </Button>
                                                    </DialogClose>

                                                    <Button
                                                        variant="destructive"
                                                        onClick={() =>
                                                            router.delete(
                                                                `/users/${user.id}`,
                                                            )
                                                        }
                                                    >
                                                        Sí, eliminar
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
