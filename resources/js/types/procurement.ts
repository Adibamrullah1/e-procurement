export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
}

export interface Category {
    id: number;
    name: string;
    description: string | null;
}

export interface Vendor {
    id: number;
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
}

export interface ProcurementItem {
    id: number;
    procurement_id: number;
    item_name: string;
    quantity: number;
    unit_price: number;
    sub_total: number;
}

export type ProcurementStatus = 'draft' | 'sending' | 'approved' | 'rejected' | 'completed';

export interface Procurement {
    id: number;
    code: string;
    title: string;
    total_amount: number;
    status: ProcurementStatus;
    status_label: string;
    status_color: string;
    finance_notes: string | null;
    created_at: string;
    updated_at: string;
    user: Partial<User>;
    user_name?: string;
    category: Partial<Category>;
    vendor: Partial<Vendor> | null;
    items?: ProcurementItem[];
}

export interface DashboardStats {
    total: number;
    draft: number;
    sending: number;
    approved: number;
    rejected: number;
    completed: number;
}
