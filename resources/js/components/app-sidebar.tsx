import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { DarkModeToggleItem } from '@/components/ui/DarkModeToggleItem';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    ClipboardList,
    LayoutGrid,
    ShoppingCart,
    User2,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Inicio',
        href: '/dashboard',
        icon: LayoutGrid,
    },

    // Gestión
    {
        title: 'Clientes',
        href: '/clients',
        icon: Users,
    },
    {
        title: 'Usuarios',
        href: '/users',
        icon: User2,
    },

    // Operación
    {
        title: 'Ordenes',
        href: '/orders',
        icon: ClipboardList,
    },
    {
        title: 'Productos',
        href: '/products',
        icon: ShoppingCart,
    },

    // Análisis
    {
        title: 'Informes',
        href: '/reports',
        icon: BarChart3,
    },
    {
        title: 'Facturas',
        href: '/bills',
        icon: LayoutGrid,
    },
];

const mainNavItemsWorker: NavItem[] = [
    // {
    //     title: 'Inicio',
    //     href: dashboard(),
    //     icon: LayoutGrid,
    // },
    {
        title: 'Ordenes',
        href: '/orders/worker',
        icon: ClipboardList,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage().props;
    const user = auth.user;
    const roleName = user.role_name;

    const homeRoute = roleName === 'Admin' ? '/dashboard' : '/orders/worker';

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={homeRoute} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {roleName === 'Admin' && <NavMain items={mainNavItems} />}
                {roleName === 'Trabajador' && (
                    <NavMain items={mainNavItemsWorker} />
                )}
                {/* <NavMain items={mainNavItems} /> */}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <DarkModeToggleItem />
                {/* <AppearanceToggleDropdown /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
