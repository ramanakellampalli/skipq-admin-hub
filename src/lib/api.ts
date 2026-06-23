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

export type AccountStatus = "ACTIVE" | "SUSPENDED";

export interface Vendor {
  id: string;
  name: string;
  isOpen: boolean;
  prepTime: number;
  campusId: string | null;
  campusName: string | null;
  city: string | null;
  phone: string | null;
  accountStatus: AccountStatus;
  suspensionNote: string | null;
  logoUrl: string | null;
  kycApproved: boolean;
  businessName: string | null;
  gstRegistered: boolean;
  gstin: string | null;
}

export interface UpdateVendorStatusPayload {
  status: AccountStatus;
  note?: string;
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

export type ServiceRequestType =
  | "REFUND_ISSUE" | "PAYMENT_ISSUE" | "ACCOUNT_ISSUE"
  | "BILLING_ISSUE" | "PAYOUT_ISSUE" | "TECHNICAL" | "OTHER";

export type ServiceRequestStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface ServiceRequest {
  id: string;
  role: "VENDOR" | "STUDENT";
  userName: string;
  userEmail: string;
  type: ServiceRequestType;
  description: string;
  status: ServiceRequestStatus;
  adminResponse: string | null;
  adminNotes: string | null;
  adminRespondedAt: string | null;
  createdAt: string;
}

export interface UpdateServiceRequestPayload {
  status: ServiceRequestStatus;
  adminResponse?: string;
  adminNotes?: string;
}

export interface AdminSyncData {
  stats: AdminStats;
  campuses: Campus[];
  vendors: Vendor[];
  orders: Order[];
  serviceRequests: ServiceRequest[];
}

export interface CreateVendorPayload {
  vendorName: string;
  email: string;
  ownerName: string;
  defaultPrepTime: number;
  campusId?: string | null;
  city?: string;
  ownerPhone: string;
  businessName: string;
  pan: string;
  bankAccount: string;
  ifsc: string;
  gstRegistered: boolean;
  gstin?: string;
}

export interface CreateCampusPayload {
  name: string;
  emailDomain: string;
}

export type PayoutStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface VendorPayout {
  id: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  settlementStartAt: string;
  settlementCutoffAt: string;
  status: PayoutStatus;
  payoutReference: string | null;
  adminNote: string | null;
  createdAt: string;
}

export interface MarkPayoutSuccessPayload {
  payoutReference: string;
  adminNote?: string;
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

  updateServiceRequest: async (id: string, payload: UpdateServiceRequestPayload): Promise<ServiceRequest> => {
    const { data } = await client.put(`/api/v1/admin/support/${id}`, payload);
    return data;
  },

  updateVendorStatus: async (id: string, payload: UpdateVendorStatusPayload): Promise<void> => {
    await client.put(`/api/v1/admin/vendors/${id}/status`, payload);
  },

  listPayouts: async (status?: PayoutStatus): Promise<VendorPayout[]> => {
    const params = status ? `?status=${status}` : "";
    const { data } = await client.get(`/api/v1/admin/payouts${params}`);
    return data;
  },

  markPayoutSuccess: async (id: string, payload: MarkPayoutSuccessPayload): Promise<VendorPayout> => {
    const { data } = await client.put(`/api/v1/admin/payouts/${id}/success`, payload);
    return data;
  },

  markPayoutFailed: async (id: string, adminNote?: string): Promise<VendorPayout> => {
    const params = adminNote ? `?adminNote=${encodeURIComponent(adminNote)}` : "";
    const { data } = await client.put(`/api/v1/admin/payouts/${id}/failed${params}`);
    return data;
  },

  uploadVendorLogo: async (vendorId: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await client.put<{ url: string }>(
      `/api/v1/profile/avatar?id=${vendorId}&type=VENDOR`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.url;
  },
};
