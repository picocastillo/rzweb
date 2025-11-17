import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

type User = {
    id: number | string;
    name: string;
    role_name: string;
    email: string;
};

export default function ShowUser({ user }: { user: User }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Usuarios', href: '/users' },
        { title: user.name, href: `/users/${user.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={user.name} />

            <div className="mx-auto max-w-lg p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Usuario</CardTitle>
                        <CardDescription>
                            Información del usuario {user.name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <p>
                                <strong>CUIL:</strong> {user.role_name ?? '-'}
                            </p>
                            <p>
                                <strong>Teléfono:</strong> {user.email ?? '-'}
                            </p>
                        </div>

                        <div className="mt-6 flex gap-4">
                            <Link
                                href={`/users/${user.id}/edit`}
                                className="rounded-lg bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
                            >
                                Editar
                            </Link>
                            <Link
                                href="/users"
                                className="rounded-lg bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
                            >
                                Volver
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
