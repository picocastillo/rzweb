export interface Order {
    id: number;
    code: string;
    address: string;
    date_from: string;
    date_to: string;
    last_state: string;
    stock_movements: StockMovement[];
    client: Client;
}

export interface Client {
    id: number;
    name: string;
    email: string;
    cuil: string;
    phone: string;
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

export interface OrderShowProps {
    order: Order;
    products: Product[];
    allProducts: Product[];
}
