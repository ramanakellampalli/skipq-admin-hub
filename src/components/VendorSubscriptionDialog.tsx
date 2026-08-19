import { useEffect, useState } from "react";
import { api, type Vendor, type SubscriptionPayment, type SubscriptionInfo } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminStore } from "@/lib/adminStore";

function subscriptionBadge(status: string, monthlyPrice: number) {
  if (monthlyPrice === 0) return <Badge variant="secondary" className="text-xs">Free Plan</Badge>;
  if (status === "PAST_DUE") return <Badge variant="destructive" className="text-xs">Past Due</Badge>;
  if (status === "SUSPENDED") return <Badge className="text-xs bg-orange-500 hover:bg-orange-600">Suspended</Badge>;
  return <Badge variant="outline" className="text-xs text-green-600 border-green-300">Active</Badge>;
}

function formatMonth(isoDate: string) {
  return new Date(isoDate + "T00:00:00").toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function formatDate(isoDate: string) {
  return new Date(isoDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

interface Props {
  vendor: Vendor;
  open: boolean;
  onClose: () => void;
}

export default function VendorSubscriptionDialog({ vendor, open, onClose }: Props) {
  const updateVendorSubscription = useAdminStore((s) => s.updateVendorSubscription);
  const sub = vendor.subscription;

  const [payments, setPayments] = useState<SubscriptionPayment[] | null>(null);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Mark payment form
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payMonth, setPayMonth] = useState(""); // YYYY-MM
  const [payAmount, setPayAmount] = useState(sub.monthlyPrice.toString());
  const [payRef, setPayRef] = useState("");
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [payNote, setPayNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit price
  const [editingPrice, setEditingPrice] = useState(false);
  const [newPrice, setNewPrice] = useState(sub.monthlyPrice.toString());
  const [savingPrice, setSavingPrice] = useState(false);

  // Suspend/reactivate
  const [togglingStatus, setTogglingStatus] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoadingPayments(true);
    api.getSubscriptionPayments(vendor.id)
      .then(setPayments)
      .finally(() => setLoadingPayments(false));
  }, [open, vendor.id]);

  const handleRecordPayment = async () => {
    if (!payMonth) return;
    setSubmitting(true);
    try {
      const paidForMonth = `${payMonth}-01`;
      await api.recordSubscriptionPayment(vendor.id, {
        amount: parseFloat(payAmount),
        paidForMonth,
        paymentReference: payRef || undefined,
        paidOn: payDate,
        adminNote: payNote || undefined,
      });
      // Optimistically update paid_through in store
      const lastDay = new Date(parseInt(payMonth.slice(0, 4)), parseInt(payMonth.slice(5, 7)), 0);
      const paidThrough = lastDay.toISOString().slice(0, 10);
      const updated: SubscriptionInfo = {
        ...sub,
        status: "ACTIVE",
        paidThrough,
        lastPaymentReference: payRef || sub.lastPaymentReference,
      };
      updateVendorSubscription(vendor.id, updated);
      // Refresh payment list
      setPayments(await api.getSubscriptionPayments(vendor.id));
      setShowPaymentForm(false);
      setPayMonth("");
      setPayRef("");
      setPayNote("");
      setPayAmount(sub.monthlyPrice.toString());
    } finally {
      setSubmitting(false);
    }
  };

  const handleSavePrice = async () => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price < 0) return;
    setSavingPrice(true);
    try {
      await api.updateSubscription(vendor.id, { monthlyPrice: price });
      updateVendorSubscription(vendor.id, { ...sub, monthlyPrice: price });
      setEditingPrice(false);
    } finally {
      setSavingPrice(false);
    }
  };

  const handleToggleStatus = async () => {
    const nextStatus = sub.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    setTogglingStatus(true);
    try {
      await api.updateSubscription(vendor.id, { status: nextStatus });
      updateVendorSubscription(vendor.id, { ...sub, status: nextStatus });
    } finally {
      setTogglingStatus(false);
    }
  };

  const canRecordPayment = sub.monthlyPrice > 0;
  const paymentFormValid = payMonth && parseFloat(payAmount) > 0 && payDate;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="flex flex-col max-h-[90vh] max-w-lg">
        <DialogHeader>
          <DialogTitle>Subscription — {vendor.name}</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 -mx-6 px-6 space-y-5">

          {/* Status + paid through */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {subscriptionBadge(sub.status, sub.monthlyPrice)}
              {sub.paidThrough && (
                <p className="text-sm text-muted-foreground">Paid through {formatDate(sub.paidThrough)}</p>
              )}
              {!sub.paidThrough && sub.monthlyPrice > 0 && (
                <p className="text-sm text-destructive">No payment recorded yet</p>
              )}
            </div>
            {sub.monthlyPrice > 0 && (
              <Button
                size="sm"
                variant={sub.status === "SUSPENDED" ? "outline" : "destructive"}
                disabled={togglingStatus}
                onClick={handleToggleStatus}
              >
                {togglingStatus ? "..." : sub.status === "SUSPENDED" ? "Re-activate" : "Suspend"}
              </Button>
            )}
          </div>

          <Separator />

          {/* Monthly price */}
          <div className="space-y-2">
            <Label>Monthly Price</Label>
            {editingPrice ? (
              <div className="flex gap-2 items-center">
                <span className="text-sm text-muted-foreground">₹</span>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-32"
                />
                <Button size="sm" onClick={handleSavePrice} disabled={savingPrice}>
                  {savingPrice ? "Saving..." : "Save"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditingPrice(false); setNewPrice(sub.monthlyPrice.toString()); }}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  {sub.monthlyPrice === 0 ? "Free" : `₹${sub.monthlyPrice.toLocaleString("en-IN")}/month`}
                </span>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setEditingPrice(true); setNewPrice(sub.monthlyPrice.toString()); }}>
                  Edit
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Mark payment received */}
          {canRecordPayment && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Record Payment</Label>
                {!showPaymentForm && (
                  <Button size="sm" variant="outline" onClick={() => setShowPaymentForm(true)}>
                    Mark received
                  </Button>
                )}
              </div>

              {showPaymentForm && (
                <div className="space-y-3 rounded-lg border p-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Month <span className="text-destructive">*</span></Label>
                    <Input
                      type="month"
                      value={payMonth}
                      onChange={(e) => setPayMonth(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Amount (₹) <span className="text-destructive">*</span></Label>
                    <Input
                      type="number"
                      min={1}
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Payment Reference</Label>
                    <Input
                      value={payRef}
                      onChange={(e) => setPayRef(e.target.value)}
                      placeholder="UPI ref, bank ref, etc."
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Date Received <span className="text-destructive">*</span></Label>
                    <Input
                      type="date"
                      value={payDate}
                      onChange={(e) => setPayDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Note</Label>
                    <Input
                      value={payNote}
                      onChange={(e) => setPayNote(e.target.value)}
                      placeholder="Optional note"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => setShowPaymentForm(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleRecordPayment} disabled={!paymentFormValid || submitting}>
                      {submitting ? "Saving..." : "Record payment"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Payment history */}
          <div className="space-y-2">
            <Label>Payment History</Label>
            {loadingPayments ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : payments && payments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Month</TableHead>
                    <TableHead className="text-xs">Amount</TableHead>
                    <TableHead className="text-xs">Reference</TableHead>
                    <TableHead className="text-xs">Received</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-sm">{formatMonth(p.paidForMonth)}</TableCell>
                      <TableCell className="text-sm">₹{p.amount.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.paymentReference ?? "—"}</TableCell>
                      <TableCell className="text-sm">{formatDate(p.paidOn)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
