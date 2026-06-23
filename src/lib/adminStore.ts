import { create } from "zustand";
import { type AdminSyncData, type ServiceRequest, type AccountStatus } from "./api";

interface AdminState extends Partial<AdminSyncData> {
  isSynced: boolean;
  setSync: (data: AdminSyncData) => void;
  updateServiceRequest: (sr: ServiceRequest) => void;
  updateVendorStatus: (id: string, status: AccountStatus, note: string | null) => void;
  updateVendorLogo: (id: string, logoUrl: string) => void;
  reset: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  isSynced: false,
  stats: undefined,
  vendors: undefined,
  orders: undefined,
  serviceRequests: undefined,
  setSync: (data) => set({ ...data, isSynced: true }),
  updateServiceRequest: (sr) =>
    set((state) => ({
      serviceRequests: state.serviceRequests?.map((r) => (r.id === sr.id ? sr : r)),
    })),
  updateVendorStatus: (id, status, note) =>
    set((state) => ({
      vendors: state.vendors?.map((v) =>
        v.id === id ? { ...v, accountStatus: status, suspensionNote: note } : v
      ),
    })),
  updateVendorLogo: (id, logoUrl) =>
    set((state) => ({
      vendors: state.vendors?.map((v) => (v.id === id ? { ...v, logoUrl } : v)),
    })),
  reset: () =>
    set({ isSynced: false, stats: undefined, campuses: undefined, vendors: undefined, orders: undefined, serviceRequests: undefined }),
}));
