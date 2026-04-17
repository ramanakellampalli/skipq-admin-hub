import { useEffect, useState } from "react";
import { api, type AdminStats } from "@/lib/api";
import { ClipboardList, Store, Clock, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const cards = [
  { key: "totalOrdersToday" as const, label: "Total Orders Today", icon: ClipboardList },
  { key: "activeVendors" as const, label: "Active Vendors", icon: Store },
  { key: "ordersInProgress" as const, label: "Orders In Progress", icon: Clock },
  { key: "revenueToday" as const, label: "Revenue Today", icon: DollarSign, format: (v: number) => `₹${v.toFixed(2)}` },
];

export default function Dashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    api.getStats().then(setStats);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.key} className="glass-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <c.icon className="h-5 w-5 text-primary" />
            </div>
            {stats ? (
              <p className="text-3xl font-bold">{c.format ? c.format(stats[c.key]) : stats[c.key]}</p>
            ) : (
              <Skeleton className="h-9 w-20" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
