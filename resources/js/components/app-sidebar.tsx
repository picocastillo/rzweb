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
import { LayoutGrid, Users, ShoppingCart, ClipboardList } from 'lucide-react';
import AppLogo from './app-logo';
import { DarkModeToggleItem } from '@/components/ui/DarkModeToggleItem';

const mainNavItems: NavItem[] = [
    // {
    //     title: 'Inicio',
    //     href: dashboard(),
    //     icon: LayoutGrid,
    // },
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

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <DarkModeToggleItem />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
