import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem, SelectLabel } from '@/components/ui/select';

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

export default function EditUser({ user, roles }: { user: User; roles: Role[] }) {
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

            <div className="max-w-lg mx-auto p-6">
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
                                <label className="block text-sm font-medium mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded-lg border px-3 py-2"
                                />
                                {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
                            </div>

                            {/* Rol */}
                            <div>
                                <label htmlFor="role-select" className="block text-sm font-medium mb-1">
                                    Rol
                                </label>

                                <Select
                                    value={String(data.role_id)}
                                    onValueChange={(value) => setData('role_id', Number(value))}
                                    disabled={processing}
                                >
                                    <SelectTrigger id="role-select" className="w-full">
                                        <SelectValue placeholder="Seleccionar un rol" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Roles Disponibles</SelectLabel>
                                            {roles.map((role) => (
                                                <SelectItem key={role.id} value={String(role.id)}>
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>

                                {errors.role_id && <p className="text-red-600 text-sm mt-1">{errors.role_id}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full rounded-lg border px-3 py-2"
                                />
                                {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Contraseña</label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full rounded-lg border px-3 py-2"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
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
