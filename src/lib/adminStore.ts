import { create } from "zustand";
import { type AdminSyncData } from "./api";

interface AdminState extends Partial<AdminSyncData> {
  isSynced: boolean;
  setSync: (data: AdminSyncData) => void;
  reset: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  isSynced: false,
  stats: undefined,
  vendors: undefined,
  orders: undefined,
  setSync: (data) => set({ ...data, isSynced: true }),
  reset: () => set({ isSynced: false, stats: undefined, vendors: undefined, orders: undefined }),
}));
