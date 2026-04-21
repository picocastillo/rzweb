import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

type Role = {
    id: number;
    name: string;
    role_name: string;
};

type CreateUserProps = {
    roles: Role[];
};

export default function CreateUser({ roles }: CreateUserProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        role_id: null as number | null,
        email: '',
        password: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Usuarios', href: '/users' },
        { title: 'Nuevo', href: '/users/create' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/users');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Usuario" />

            <div className="mx-auto max-w-lg p-6">
                <h1 className="mb-4 text-2xl font-semibold">Agregar Usuario</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Nombre Completo
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full rounded-lg border px-3 py-2"
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600">
                                {errors.name}
                            </p>
                        )}
                    </div>

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
                                setData('role_id', Number(e.target.value))
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-sky-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            disabled={processing}
                        >
                            <option value="">Seleccionar un rol</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.role_name}
                                </option>
                            ))}
                        </select>
                        {errors.role_id && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.role_id}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Email
                        </label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full rounded-lg border px-3 py-2"
                        />
                        {errors.email && (
                            <p className="text-sm text-red-600">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Contrasena
                        </label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="w-full rounded-lg border px-3 py-2"
                        />
                        {errors.password && (
                            <p className="text-sm text-red-600">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-sky-600 px-4 py-2 text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Guardar
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
