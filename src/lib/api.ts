import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL as string;

const client = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("skipq_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("skipq_token");
      localStorage.removeItem("skipq_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export type OrderStatus = "PENDING" | "ACCEPTED" | "PREPARING" | "READY" | "COMPLETED" | "REJECTED";

export interface Campus {
  id: string;
  name: string;
  emailDomain: string;
}

export interface Vendor {
  id: string;
  name: string;
  isOpen: boolean;
  prepTime: number;
  campusId: string;
  campusName: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  vendor: { id: string; name: string };
  state: { orderStatus: OrderStatus; paymentStatus: string };
  pricing: {
    subtotal: number;
    tax: { cgst: number; sgst: number; igst: number; totalTax: number };
    fees: { platformFee: number; paymentTerminalFee: number; totalServiceFee: number };
    totalAmount: number;
  };
  timeline: { createdAt: string; estimatedReadyAt: string };
  items: OrderItem[];
}

export interface AdminStats {
  totalOrdersToday: number;
  activeVendors: number;
  ordersInProgress: number;
  revenueToday: number;
}

export interface AdminSyncData {
  stats: AdminStats;
  campuses: Campus[];
  vendors: Vendor[];
  orders: Order[];
}

export interface CreateVendorPayload {
  vendorName: string;
  email: string;
  ownerName: string;
  defaultPrepTime: number;
  campusId: string;
}

export interface CreateCampusPayload {
  name: string;
  emailDomain: string;
}

export const api = {
  login: async (email: string, password: string) => {
    const { data } = await client.post("/api/v1/auth/login", { email, password });
    return data;
  },

  sync: async (): Promise<AdminSyncData> => {
    const { data } = await client.get("/api/v1/admin/sync");
    return data;
  },

  createVendor: async (payload: CreateVendorPayload): Promise<void> => {
    await client.post("/api/v1/admin/vendors", payload);
  },

  createCampus: async (payload: CreateCampusPayload): Promise<Campus> => {
    const { data } = await client.post("/api/v1/admin/campuses", payload);
    return data;
  },
};
