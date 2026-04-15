// Mock API service layer — replace with real API calls later

export interface Vendor {
  id: string;
  name: string;
  status: "open" | "closed";
  prepTime: number;
}

export interface MenuItem {
  id: string;
  vendorId: string;
  name: string;
  price: number;
  category: string;
  available: boolean;
}

export type OrderStatus = "PENDING" | "ACCEPTED" | "PREPARING" | "READY";

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  vendorId: string;
  vendorName: string;
  items: OrderItem[];
  status: OrderStatus;
  time: string;
  studentName: string;
  total: number;
}

// Mock data
const vendors: Vendor[] = [
  { id: "v1", name: "Campus Grill", status: "open", prepTime: 12 },
  { id: "v2", name: "Noodle House", status: "open", prepTime: 8 },
  { id: "v3", name: "Fresh Bites", status: "closed", prepTime: 15 },
  { id: "v4", name: "Café Mocha", status: "open", prepTime: 5 },
  { id: "v5", name: "Wrap Station", status: "open", prepTime: 10 },
];

const menuItems: MenuItem[] = [
  { id: "m1", vendorId: "v1", name: "Classic Burger", price: 8.99, category: "Burgers", available: true },
  { id: "m2", vendorId: "v1", name: "Cheese Fries", price: 4.50, category: "Sides", available: true },
  { id: "m3", vendorId: "v1", name: "Grilled Chicken Wrap", price: 7.99, category: "Wraps", available: false },
  { id: "m4", vendorId: "v2", name: "Pad Thai", price: 9.50, category: "Noodles", available: true },
  { id: "m5", vendorId: "v2", name: "Ramen Bowl", price: 10.99, category: "Noodles", available: true },
  { id: "m6", vendorId: "v2", name: "Spring Rolls", price: 5.50, category: "Appetizers", available: true },
  { id: "m7", vendorId: "v3", name: "Caesar Salad", price: 7.50, category: "Salads", available: true },
  { id: "m8", vendorId: "v3", name: "Smoothie Bowl", price: 8.99, category: "Bowls", available: true },
  { id: "m9", vendorId: "v4", name: "Latte", price: 4.50, category: "Drinks", available: true },
  { id: "m10", vendorId: "v4", name: "Croissant", price: 3.50, category: "Pastries", available: true },
  { id: "m11", vendorId: "v5", name: "Chicken Shawarma", price: 8.50, category: "Wraps", available: true },
  { id: "m12", vendorId: "v5", name: "Falafel Wrap", price: 7.99, category: "Wraps", available: true },
];

const statuses: OrderStatus[] = ["PENDING", "ACCEPTED", "PREPARING", "READY"];

function generateOrders(): Order[] {
  const now = new Date();
  return Array.from({ length: 15 }, (_, i) => {
    const vendor = vendors[Math.floor(Math.random() * vendors.length)];
    const itemCount = Math.floor(Math.random() * 3) + 1;
    const items: OrderItem[] = Array.from({ length: itemCount }, () => {
      const m = menuItems[Math.floor(Math.random() * menuItems.length)];
      return { name: m.name, quantity: Math.floor(Math.random() * 2) + 1, price: m.price };
    });
    const time = new Date(now.getTime() - Math.random() * 3600000);
    return {
      id: `ORD-${String(1000 + i)}`,
      vendorId: vendor.id,
      vendorName: vendor.name,
      items,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      time: time.toISOString(),
      studentName: ["Alex Kim", "Jordan Lee", "Sam Patel", "Taylor Chen", "Morgan Wu"][Math.floor(Math.random() * 5)],
      total: items.reduce((s, it) => s + it.price * it.quantity, 0),
    };
  });
}

let ordersCache = generateOrders();

// Simulate slight changes on each poll
function refreshOrders() {
  ordersCache = ordersCache.map((o) => {
    if (Math.random() > 0.85) {
      const idx = statuses.indexOf(o.status);
      if (idx < statuses.length - 1) return { ...o, status: statuses[idx + 1] };
    }
    return o;
  });
  return ordersCache;
}

// API functions
export const api = {
  login: async (email: string, _password: string) => {
    await delay(500);
    if (!email) throw new Error("Invalid credentials");
    return { token: "mock-jwt-token", user: { email, name: "Admin" } };
  },

  getVendors: async (): Promise<Vendor[]> => {
    await delay(300);
    return [...vendors];
  },

  addVendor: async (data: Omit<Vendor, "id">): Promise<Vendor> => {
    await delay(300);
    const v: Vendor = { ...data, id: `v${Date.now()}` };
    vendors.push(v);
    return v;
  },

  updateVendor: async (id: string, data: Partial<Vendor>): Promise<Vendor> => {
    await delay(300);
    const idx = vendors.findIndex((v) => v.id === id);
    if (idx === -1) throw new Error("Vendor not found");
    vendors[idx] = { ...vendors[idx], ...data };
    return vendors[idx];
  },

  getMenuItems: async (vendorId?: string): Promise<MenuItem[]> => {
    await delay(300);
    return vendorId ? menuItems.filter((m) => m.vendorId === vendorId) : [...menuItems];
  },

  addMenuItem: async (data: Omit<MenuItem, "id">): Promise<MenuItem> => {
    await delay(300);
    const m: MenuItem = { ...data, id: `m${Date.now()}` };
    menuItems.push(m);
    return m;
  },

  updateMenuItem: async (id: string, data: Partial<MenuItem>): Promise<MenuItem> => {
    await delay(300);
    const idx = menuItems.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error("Item not found");
    menuItems[idx] = { ...menuItems[idx], ...data };
    return menuItems[idx];
  },

  getOrders: async (): Promise<Order[]> => {
    await delay(200);
    return refreshOrders();
  },

  getDashboardStats: async () => {
    await delay(300);
    const orders = ordersCache;
    return {
      totalOrdersToday: orders.length,
      activeVendors: vendors.filter((v) => v.status === "open").length,
      ordersInProgress: orders.filter((o) => o.status === "PREPARING" || o.status === "ACCEPTED").length,
      totalRevenue: orders.reduce((s, o) => s + o.total, 0),
    };
  },
};

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
