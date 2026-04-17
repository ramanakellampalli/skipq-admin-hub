import { useEffect, useState } from "react";
import { api, type Order } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => {
    api.getOrders().then((data) => { setOrders(data); setLoading(false); });
  }, []);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>

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
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-20" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              orders.map((o) => (
                <TableRow key={o.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setSelected(o)}>
                  <TableCell className="font-mono text-sm">{o.id.slice(0, 8).toUpperCase()}</TableCell>
                  <TableCell>{o.vendorName}</TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-48 truncate">
                    {o.items.map((it) => `${it.quantity}x ${it.name}`).join(", ")}
                  </TableCell>
                  <TableCell><StatusBadge status={o.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{formatTime(o.createdAt)}</TableCell>
                  <TableCell>₹{Number(o.totalAmount).toFixed(2)}</TableCell>
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
                  <StatusBadge status={selected.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vendor</span>
                  <span>{selected.vendorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span>{formatTime(selected.createdAt)}</span>
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
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary">₹{Number(selected.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
