export type EncomendasResourceStatus =
  | 'ready'
  | 'empty'
  | 'unavailable'
  | 'schema-mismatch';

export interface EncomendasResourceResult<T> {
  status: EncomendasResourceStatus;
  data: T;
  message: string;
  source?: string;
}

export interface EncomendasOrder {
  id: string;
  code: string;
  customerName: string;
  customerId?: string;
  status: string;
  total: number;
  itemCount: number;
  createdAt?: string;
  expectedDeliveryAt?: string;
  channel?: string;
}

export interface EncomendasCustomer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  status: string;
  activeOrders: number;
  totalOrders: number;
  lifetimeValue: number;
  lastOrderAt?: string;
}

export interface EncomendasProduct {
  id: string;
  name: string;
  sku: string;
  category?: string;
  price: number;
  stock: number;
  reservedStock: number;
  status: string;
  updatedAt?: string;
}

export interface EncomendasCharge {
  id: string;
  reference: string;
  customerName: string;
  status: string;
  amount: number;
  dueAt?: string;
  paidAt?: string;
  paymentMethod?: string;
}

export interface EncomendasOverviewStats {
  totalOrders: number;
  activeCustomers: number;
  totalRevenue: number;
  averageTicket: number;
  pendingCharges: number;
  overdueCharges: number;
}

export interface EncomendasOverviewData {
  stats: EncomendasOverviewStats;
  recentOrders: EncomendasOrder[];
  customers: EncomendasCustomer[];
  products: EncomendasProduct[];
  charges: EncomendasCharge[];
}

export interface EncomendasCustomersData {
  summary: {
    totalCustomers: number;
    activeCustomers: number;
    newCustomers: number;
    averageLifetimeValue: number;
    customersWithOpenCharges: number;
  };
  customers: EncomendasCustomer[];
}

export interface EncomendasCatalogData {
  summary: {
    totalProducts: number;
    activeProducts: number;
    lowStockProducts: number;
    inventoryValue: number;
  };
  products: EncomendasProduct[];
}

export interface EncomendasChargesData {
  summary: {
    totalCharges: number;
    openCharges: number;
    overdueCharges: number;
    paidCharges: number;
    totalOpenAmount: number;
  };
  charges: EncomendasCharge[];
}

export const emptyEncomendasOverviewData: EncomendasOverviewData = {
  stats: {
    totalOrders: 0,
    activeCustomers: 0,
    totalRevenue: 0,
    averageTicket: 0,
    pendingCharges: 0,
    overdueCharges: 0,
  },
  recentOrders: [],
  customers: [],
  products: [],
  charges: [],
};

export const emptyEncomendasCustomersData: EncomendasCustomersData = {
  summary: {
    totalCustomers: 0,
    activeCustomers: 0,
    newCustomers: 0,
    averageLifetimeValue: 0,
    customersWithOpenCharges: 0,
  },
  customers: [],
};

export const emptyEncomendasCatalogData: EncomendasCatalogData = {
  summary: {
    totalProducts: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    inventoryValue: 0,
  },
  products: [],
};

export const emptyEncomendasChargesData: EncomendasChargesData = {
  summary: {
    totalCharges: 0,
    openCharges: 0,
    overdueCharges: 0,
    paidCharges: 0,
    totalOpenAmount: 0,
  },
  charges: [],
};
