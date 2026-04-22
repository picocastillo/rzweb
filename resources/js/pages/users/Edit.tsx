import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

type Role = {
    id: number;
    name: string;
};

type User = {
    id: number | string;
    name: string;
    role_id: number;
    role_name: string;
    email: string;
};

export default function EditUser({
    user,
    roles,
}: {
    user: User;
    roles: Role[];
}) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        role_id: user.role_id || '',
        email: user.email || '',
        password: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Usuarios', href: '/users' },
        { title: user.name, href: `/users/${user.id}/edit` },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/users/${user.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar ${user.name}`} />

            <div className="mx-auto max-w-lg p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Editar Usuario</CardTitle>
                        <CardDescription>
                            Actualiza la información del usuario {user.name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Nombre */}
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Nombre Completo
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="w-full rounded-lg border px-3 py-2"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Rol */}
                            <div>
                                <label
                                    htmlFor="role-select"
                                    className="mb-1 block text-sm font-medium"
                                >
                                    Rol
                                </label>
                                <select
                                    id="role-select"
                                    value={data.role_id?.toString() ?? ''}
                                    onChange={(e) =>
                                        setData(
                                            'role_id',
                                            Number(e.target.value),
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-sky-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    disabled={processing}
                                >
                                    <option value="">Seleccionar un rol</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.role_id && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.role_id}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    className="w-full rounded-lg border px-3 py-2"
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-600">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    className="w-full rounded-lg border px-3 py-2"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                            >
                                {processing ? 'Actualizando...' : 'Actualizar'}
                            </button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
