import { useEffect, useState } from "react";
import { Pencil, CheckCircle2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { api, type Vendor, type SubscriptionPayment, type SubscriptionInfo } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminStore } from "@/lib/adminStore";

const PAGE_SIZE = 6;

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
  const sub = useAdminStore((s) => s.vendors?.find((v) => v.id === vendor.id)?.subscription ?? vendor.subscription);

  const [payments, setPayments] = useState<SubscriptionPayment[] | null>(null);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payMonth, setPayMonth] = useState("");
  const [payAmount, setPayAmount] = useState(sub.monthlyPrice.toString());
  const [payRef, setPayRef] = useState("");
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [payNote, setPayNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [editingPrice, setEditingPrice] = useState(false);
  const [newPrice, setNewPrice] = useState(sub.monthlyPrice.toString());
  const [savingPrice, setSavingPrice] = useState(false);

  const [historyPage, setHistoryPage] = useState(0);

  useEffect(() => {
    if (!open) return;
    setHistoryPage(0);
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
      const lastDay = new Date(parseInt(payMonth.slice(0, 4)), parseInt(payMonth.slice(5, 7)), 0);
      const paidThrough = lastDay.toISOString().slice(0, 10);
      const updated: SubscriptionInfo = {
        ...sub,
        status: "ACTIVE",
        paidThrough,
        lastPaymentReference: payRef || sub.lastPaymentReference,
      };
      updateVendorSubscription(vendor.id, updated);
      setPayments(await api.getSubscriptionPayments(vendor.id));
      setHistoryPage(0);
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

  const isPastDue = sub.status === "PAST_DUE";
  const isFree = sub.monthlyPrice === 0;
  const currentMonthPrefix = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const currentMonthPaid = payments?.some((p) => p.paidForMonth.startsWith(currentMonthPrefix)) ?? false;
  const paymentFormValid = payMonth && parseFloat(payAmount) > 0 && payDate;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="flex flex-col max-h-[90vh] max-w-2xl">
        <DialogHeader>
          <DialogTitle>Subscription — {vendor.name}</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 -mx-6 px-6 space-y-4">

          {/* Top summary card */}
          <div className={`rounded-xl border p-4 space-y-3 ${isPastDue ? "border-destructive/40 bg-destructive/5" : "border-border bg-muted/30"}`}>

            {/* Status + paid through */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Status</p>
                {isFree ? (
                  <span className="text-sm font-semibold text-muted-foreground">Free Plan</span>
                ) : isPastDue ? (
                  <span className="text-sm font-bold text-destructive">Payment Overdue</span>
                ) : (
                  <span className="text-sm font-bold text-green-600">Active</span>
                )}
                {sub.paidThrough && (
                  <p className="text-xs text-muted-foreground mt-0.5">Paid through {formatDate(sub.paidThrough)}</p>
                )}
                {!sub.paidThrough && !isFree && (
                  <p className="text-xs text-destructive mt-0.5">No payment recorded yet</p>
                )}
              </div>

              {/* Monthly price */}
              <div className="text-right shrink-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Monthly Fee</p>
                {editingPrice ? (
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-sm text-muted-foreground">₹</span>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-24 h-8 text-sm"
                      autoFocus
                    />
                    <Button size="icon" className="h-8 w-8" onClick={handleSavePrice} disabled={savingPrice}>
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditingPrice(false); setNewPrice(sub.monthlyPrice.toString()); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditingPrice(true); setNewPrice(sub.monthlyPrice.toString()); }}
                    className="group flex items-center gap-1.5 justify-end"
                  >
                    <span className="text-2xl font-bold text-foreground">
                      {isFree ? "Free" : `₹${sub.monthlyPrice.toLocaleString("en-IN")}`}
                    </span>
                    {!isFree && <span className="text-xs text-muted-foreground">/mo</span>}
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
              </div>
            </div>

            {/* Mark payment CTA — wait for payments to load before rendering either state */}
            {!isFree && !showPaymentForm && !loadingPayments && (
              currentMonthPaid ? (
                <p className="text-xs text-center text-green-600 font-medium py-1">
                  Payment received for this month
                </p>
              ) : (
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => { setShowPaymentForm(true); setPayAmount(sub.monthlyPrice.toString()); }}
                >
                  Mark Payment Received
                </Button>
              )
            )}
          </div>

          {/* Payment form — inline below card when open */}
          {showPaymentForm && (
            <div className="rounded-xl border border-border bg-background p-4 space-y-3">
              <p className="text-sm font-semibold">Record Payment</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Month <span className="text-destructive">*</span></Label>
                  <Input type="month" value={payMonth} onChange={(e) => setPayMonth(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Amount (₹) <span className="text-destructive">*</span></Label>
                  <Input type="number" min={1} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Payment Reference</Label>
                  <Input value={payRef} onChange={(e) => setPayRef(e.target.value)} placeholder="UPI ref, bank ref…" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Date Received <span className="text-destructive">*</span></Label>
                  <Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Note</Label>
                <Input value={payNote} onChange={(e) => setPayNote(e.target.value)} placeholder="Optional note" />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <Button size="sm" variant="ghost" onClick={() => setShowPaymentForm(false)}>Cancel</Button>
                <Button size="sm" onClick={handleRecordPayment} disabled={!paymentFormValid || submitting}>
                  {submitting ? "Saving..." : "Confirm Payment"}
                </Button>
              </div>
            </div>
          )}

          {/* Payment history */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment History</p>
              {payments && payments.length > 0 && (
                <p className="text-xs text-muted-foreground">{payments.length} payment{payments.length !== 1 ? "s" : ""}</p>
              )}
            </div>
            {loadingPayments ? (
              <p className="text-sm text-muted-foreground py-2">Loading…</p>
            ) : payments && payments.length > 0 ? (() => {
              const totalPages = Math.ceil(payments.length / PAGE_SIZE);
              const page = payments.slice(historyPage * PAGE_SIZE, (historyPage + 1) * PAGE_SIZE);
              return (
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Received On</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {page.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{formatMonth(p.paidForMonth)}</TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(p.paidOn)}</TableCell>
                          <TableCell className="text-muted-foreground font-mono text-xs">{p.paymentReference ?? "—"}</TableCell>
                          <TableCell className="text-right font-semibold tabular-nums">
                            ₹{p.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30">
                      <Button
                        variant="ghost" size="sm"
                        disabled={historyPage === 0}
                        onClick={() => setHistoryPage((p) => p - 1)}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Page {historyPage + 1} of {totalPages}
                      </p>
                      <Button
                        variant="ghost" size="sm"
                        disabled={historyPage === totalPages - 1}
                        onClick={() => setHistoryPage((p) => p + 1)}
                      >
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })() : (
              <p className="text-sm text-muted-foreground py-2">No payments recorded yet.</p>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
