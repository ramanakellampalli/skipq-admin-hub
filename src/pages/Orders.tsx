import { useMemo, useState } from "react";
import { type Order, type OrderStatus } from "@/lib/api";
import { useAdminStore } from "@/lib/adminStore";
import { StatusBadge } from "@/components/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TabGroup = "active" | "completed" | "rejected";

const TAB_STATUSES: Record<TabGroup, OrderStatus[]> = {
  active:    ["PENDING", "ACCEPTED", "PREPARING", "READY"],
  completed: ["COMPLETED"],
  rejected:  ["REJECTED"],
};

export default function Orders() {
  const orders = useAdminStore((s) => s.orders);
  const vendors = useAdminStore((s) => s.vendors);
  const [tab, setTab] = useState<TabGroup>("active");
  const [vendorId, setVendorId] = useState<string>("all");
  const [selected, setSelected] = useState<Order | null>(null);

  const filtered = useMemo(() => {
    if (!orders) return null;
    return orders.filter((o) => {
      const matchesTab = TAB_STATUSES[tab].includes(o.state.orderStatus);
      const matchesVendor = vendorId === "all" || o.vendor.id === vendorId;
      return matchesTab && matchesVendor;
    });
  }, [orders, tab, vendorId]);

  const counts = useMemo(() => {
    if (!orders) return { active: 0, completed: 0, rejected: 0 };
    return {
      active:    orders.filter((o) => TAB_STATUSES.active.includes(o.state.orderStatus)).length,
      completed: orders.filter((o) => TAB_STATUSES.completed.includes(o.state.orderStatus)).length,
      rejected:  orders.filter((o) => TAB_STATUSES.rejected.includes(o.state.orderStatus)).length,
    };
  }, [orders]);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Tabs value={tab} onValueChange={(v) => { setTab(v as TabGroup); setVendorId("all"); }}>
          <TabsList>
            <TabsTrigger value="active">
              Active {orders && <span className="ml-1.5 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">{counts.active}</span>}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed {orders && <span className="ml-1.5 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{counts.completed}</span>}
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected {orders && <span className="ml-1.5 text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full">{counts.rejected}</span>}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={vendorId} onValueChange={setVendorId}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All vendors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All vendors</SelectItem>
            {(vendors ?? []).map((v) => (
              <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!filtered ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-20" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  No {tab} orders{vendorId !== "all" ? " for this vendor" : ""}.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((o) => (
                <TableRow key={o.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setSelected(o)}>
                  <TableCell className="font-mono text-sm">{o.id.slice(0, 8).toUpperCase()}</TableCell>
                  <TableCell>{o.vendor.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-48 truncate">
                    {o.items.map((it) => `${it.quantity}x ${it.name}`).join(", ")}
                  </TableCell>
                  <TableCell><StatusBadge status={o.state.orderStatus} /></TableCell>
                  <TableCell className="text-muted-foreground">{formatTime(o.timeline.createdAt)}</TableCell>
                  <TableCell>₹{Number(o.pricing.totalAmount).toFixed(2)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="sm:max-w-md">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="font-mono">{selected.id.slice(0, 8).toUpperCase()}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge status={selected.state.orderStatus} />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vendor</span>
                  <span>{selected.vendor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span>{formatTime(selected.timeline.createdAt)}</span>
                </div>
                <Separator />
                <div className="space-y-2">
                  <span className="text-sm font-semibold">Items</span>
                  {selected.items.map((it, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{it.quantity}x {it.name}</span>
                      <span className="text-muted-foreground">₹{Number(it.subtotal).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{Number(selected.pricing.subtotal).toFixed(2)}</span>
                </div>
                {selected.pricing.tax.totalTax > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>GST</span>
                    <span>₹{Number(selected.pricing.tax.totalTax).toFixed(2)}</span>
                  </div>
                )}
                {selected.pricing.fees.totalServiceFee > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Service fee</span>
                    <span>₹{Number(selected.pricing.fees.totalServiceFee).toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary">₹{Number(selected.pricing.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
