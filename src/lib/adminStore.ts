import { create } from "zustand";
import { type AdminSyncData, type ServiceRequest } from "./api";

interface AdminState extends Partial<AdminSyncData> {
  isSynced: boolean;
  setSync: (data: AdminSyncData) => void;
  updateServiceRequest: (sr: ServiceRequest) => void;
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
  reset: () =>
    set({ isSynced: false, stats: undefined, campuses: undefined, vendors: undefined, orders: undefined, serviceRequests: undefined }),
}));
