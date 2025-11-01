import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

type Client = {
    id: number | string;
    name: string;
    cuil?: string | null;
    phone?: string | null;
};

interface Client {
    id: number;
    name: string;
    cuil: string;
    phone: string;
}

interface Order {
    id: number;
    user_id: number;
    client_id: number;
    last_state: string;
    address: string;
    code: string;
    date_from: string;
    date_to: string;
    is_active: boolean;
}

interface ItemOrder {
    id: number;
    order_id: number;
    stock_movement_id: number;
    product_name: string;
    quantity: number;
    current_cost?: number;
}
