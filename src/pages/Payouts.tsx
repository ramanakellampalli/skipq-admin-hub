import { useEffect, useState } from "react";
import { api, type VendorPayout, type PayoutStatus, type MarkPayoutSuccessPayload } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function PayoutStatusBadge({ status }: { status: PayoutStatus }) {
  if (status === "PENDING") return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-100">Pending</Badge>;
  if (status === "SUCCESS") return <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-100">Paid</Badge>;
  return <Badge variant="destructive">Failed</Badge>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatAmount(amount: number) {
  return `₹${amount.toFixed(2)}`;
}

export default function Payouts() {
  const [payouts, setPayouts] = useState<VendorPayout[] | null>(null);
  const [filter, setFilter] = useState<"ALL" | PayoutStatus>("ALL");

  const [markPaidTarget, setMarkPaidTarget] = useState<VendorPayout | null>(null);
  const [payoutRef, setPayoutRef] = useState("");
  const [payoutNote, setPayoutNote] = useState("");
  const [saving, setSaving] = useState(false);

  const [failTarget, setFailTarget] = useState<VendorPayout | null>(null);
  const [failNote, setFailNote] = useState("");
  const [failing, setFailing] = useState(false);

  const load = async (status?: PayoutStatus) => {
    setPayouts(null);
    const data = await api.listPayouts(status);
    setPayouts(data);
  };

  useEffect(() => {
    load(filter === "ALL" ? undefined : filter);
  }, [filter]);

  const handleMarkPaid = async () => {
    if (!markPaidTarget || !payoutRef.trim()) return;
    setSaving(true);
    try {
      const payload: MarkPayoutSuccessPayload = {
        payoutReference: payoutRef.trim(),
        adminNote: payoutNote.trim() || undefined,
      };
      const updated = await api.markPayoutSuccess(markPaidTarget.id, payload);
      setPayouts((prev) => prev?.map((p) => (p.id === updated.id ? updated : p)) ?? null);
      setMarkPaidTarget(null);
      setPayoutRef("");
      setPayoutNote("");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkFailed = async () => {
    if (!failTarget) return;
    setFailing(true);
    try {
      const updated = await api.markPayoutFailed(failTarget.id, failNote.trim() || undefined);
      setPayouts((prev) => prev?.map((p) => (p.id === updated.id ? updated : p)) ?? null);
      setFailTarget(null);
      setFailNote("");
    } finally {
      setFailing(false);
    }
  };

  const pendingCount = payouts?.filter((p) => p.status === "PENDING").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vendor Payouts</h1>
          {payouts && pendingCount > 0 && filter !== "PENDING" && (
            <p className="text-sm text-muted-foreground mt-0.5">{pendingCount} pending transfer{pendingCount > 1 ? "s" : ""} awaiting action</p>
          )}
        </div>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="SUCCESS">Paid</TabsTrigger>
          <TabsTrigger value="FAILED">Failed</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Settlement Window</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {!payouts ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-24" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : payouts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  No payouts found.
                </TableCell>
              </TableRow>
            ) : (
              payouts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.vendorName}</TableCell>
                  <TableCell className="font-mono">{formatAmount(p.amount)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(p.settlementStartAt)} – {formatDate(p.settlementCutoffAt)}
                  </TableCell>
                  <TableCell><PayoutStatusBadge status={p.status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.payoutReference ?? "—"}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {p.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => { setMarkPaidTarget(p); setPayoutRef(""); setPayoutNote(""); }}
                        >
                          Mark Paid
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setFailTarget(p); setFailNote(""); }}
                        >
                          Mark Failed
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mark Paid modal */}
      <Dialog open={!!markPaidTarget} onOpenChange={(open) => { if (!open) setMarkPaidTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Paid — {markPaidTarget?.vendorName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Confirm you have transferred <span className="font-semibold text-foreground">{markPaidTarget ? formatAmount(markPaidTarget.amount) : ""}</span> to this vendor via UPI or NEFT.
            </p>
            <div className="space-y-2">
              <Label>Transaction Reference <span className="text-destructive">*</span></Label>
              <Input
                value={payoutRef}
                onChange={(e) => setPayoutRef(e.target.value)}
                placeholder="e.g. UPI/230622/XYZ123 or NEFT ref"
              />
            </div>
            <div className="space-y-2">
              <Label>Note <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea
                value={payoutNote}
                onChange={(e) => setPayoutNote(e.target.value)}
                placeholder="Any additional context"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMarkPaidTarget(null)}>Cancel</Button>
            <Button onClick={handleMarkPaid} disabled={!payoutRef.trim() || saving}>
              {saving ? "Confirming..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark Failed modal */}
      <Dialog open={!!failTarget} onOpenChange={(open) => { if (!open) setFailTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Failed — {failTarget?.vendorName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This payout will be marked as failed. The reserved ledger entries will be released and picked up in the next settlement cycle.
            </p>
            <div className="space-y-2">
              <Label>Reason <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea
                value={failNote}
                onChange={(e) => setFailNote(e.target.value)}
                placeholder="e.g. Bank account details incorrect, will retry tomorrow"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFailTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleMarkFailed} disabled={failing}>
              {failing ? "Marking..." : "Confirm Failed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
