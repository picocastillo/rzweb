
export interface Order {
    id: number;
    code: string;
    address: string;
    date_from: string;
    date_to: string;
    name_last_state: string;
    stock_movements: StockMovement[];
    client: Client;
    states: OrderState[];
    notes: Note[];
    assigned_to: number;
    name_assigned_to: string;
    files: File[];
}

export interface Note {
    id:number,
    message: string,
    check: boolean,
    user_id: number,
    is_private: boolean,
    order_id: number,
    created_at: Date,
    updated_at: Date,
}

export interface File {
    id: number;
    name: string;
    url: string;
    is_private: boolean;
    created_at: string;
    user?: { name: string };
}

export interface Client {
    id: number;
    name: string;
    email: string;
    cuil: string;
    phone: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role_id: number;
}

export interface StockMovement {
    id: number;
    product_id: number;
    qty: number;
    type: number;
    created_at: string;
}

export interface Product {
    id: number;
    name: string;
    current_stock: number;
}

export interface OrderState {
    id: number;
    order_id: number;
    name: number;
    name_state: string;
    created_at: Date;
}

export interface OrderShowProps {
    order: Order;
    products: Product[];
    allProducts: Product[];
    available_workers: User[];
}
