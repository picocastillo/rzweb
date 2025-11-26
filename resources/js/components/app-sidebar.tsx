import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, Users, ShoppingCart, ClipboardList, User2 } from 'lucide-react';
import AppLogo from './app-logo';
//import { DarkModeToggleItem } from '@/components/ui/DarkModeToggleItem';
import { usePage } from '@inertiajs/react';
import AppearanceToggleDropdown from './appearance-dropdown';

const mainNavItems: NavItem[] = [
    // {
    //     title: 'Inicio',
    //     href: dashboard(),
    //     icon: LayoutGrid,
    // },
    {
        title: 'Usuarios',
        href: '/users', 
        icon: User2,
    },
    {
        title: 'Clientes',
        href: '/clients',
        icon: Users,
    },
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
    {
        title: 'Reportes',
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

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {roleName === 'Admin' && <NavMain items={mainNavItems} />}
                {roleName === 'Trabajador' && <NavMain items={mainNavItemsWorker} />}
                {/* <NavMain items={mainNavItems} /> */}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                {/* <DarkModeToggleItem /> */}
                <AppearanceToggleDropdown />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
