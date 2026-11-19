export interface ProductItem {
  id: string;
  code: string | null;
  name: string;
  note?: string | null;
}

export interface SupplierSection {
  id: string;
  label: string | null;
  products: ProductItem[];
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  sections: SupplierSection[];
}

export type QuantitiesMap = Record<string, number>;

export interface SentSupplierSnapshot {
  supplierId: string;
  supplierName: string;
  phone: string;
  sections: {
    label: string | null;
    items: {
      productId: string;
      code: string | null;
      name: string;
      qty: number;
    }[];
  }[];
}

export interface OrderHistoryEntry {
  id: string;
  createdAt: string;
  deliveryDay: string;
  totalItems: number;
  totalUnits: number;
  suppliers: SentSupplierSnapshot[];
}

export type AppTab = 'order' | 'dispatch' | 'history' | 'catalog';

export type ThemePreference = 'system' | 'light' | 'dark';
