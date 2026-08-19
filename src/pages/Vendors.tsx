import { useRef, useState } from "react";
import { api, type CreateVendorPayload, type Vendor, type SubscriptionStatus } from "@/lib/api";
import { useAdminStore } from "@/lib/adminStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ImageUp, MoreHorizontal, Plus, CreditCard, ShieldOff, ShieldCheck } from "lucide-react";
import VendorSubscriptionDialog from "@/components/VendorSubscriptionDialog";

type SubFilter = "ALL" | SubscriptionStatus;

function subBadge(status: SubscriptionStatus, monthlyPrice: number) {
  if (monthlyPrice === 0) return <Badge variant="secondary" className="text-xs">Free</Badge>;
  if (status === "PAST_DUE") return <Badge variant="destructive" className="text-xs">Past Due</Badge>;
  return <Badge variant="outline" className="text-xs text-green-600 border-green-300">Active</Badge>;
}

const emptyForm: CreateVendorPayload = {
  vendorName: "", email: "", ownerName: "", defaultPrepTime: 10,
  campusId: null, city: "", ownerPhone: "",
  businessName: "", pan: "", bankAccount: "", ifsc: "",
  gstRegistered: false, gstin: "",
  subscriptionMonthlyPrice: 0,
};

export default function Vendors() {
  const vendors = useAdminStore((s) => s.vendors);
  const campuses = useAdminStore((s) => s.campuses);
  const setSync = useAdminStore((s) => s.setSync);
  const updateVendorStatus = useAdminStore((s) => s.updateVendorStatus);
  const updateVendorLogo = useAdminStore((s) => s.updateVendorLogo);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateVendorPayload>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [suspendTarget, setSuspendTarget] = useState<Vendor | null>(null);
  const [suspendNote, setSuspendNote] = useState("");
  const [suspending, setSuspending] = useState(false);

  const [subFilter, setSubFilter] = useState<SubFilter>("ALL");
  const [subDialogVendor, setSubDialogVendor] = useState<Vendor | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<Vendor | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleLogoClick = (v: Vendor) => {
    setUploadTarget(v);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;
    e.target.value = "";
    setUploading(true);
    try {
      const url = await api.uploadVendorLogo(uploadTarget.id, file);
      updateVendorLogo(uploadTarget.id, url);
    } finally {
      setUploading(false);
      setUploadTarget(null);
    }
  };

  const handleSuspend = async () => {
    if (!suspendTarget) return;
    setSuspending(true);
    try {
      await api.updateVendorStatus(suspendTarget.id, { status: "SUSPENDED", note: suspendNote });
      updateVendorStatus(suspendTarget.id, "SUSPENDED", suspendNote);
      setSuspendTarget(null);
      setSuspendNote("");
    } finally {
      setSuspending(false);
    }
  };

  const handleReinstate = async (v: Vendor) => {
    await api.updateVendorStatus(v.id, { status: "ACTIVE" });
    updateVendorStatus(v.id, "ACTIVE", null);
  };

  const openAdd = () => { setForm(emptyForm); setError(""); setDialogOpen(true); };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await api.createVendor({
        ...form,
        ownerPhone: `+91${form.ownerPhone}`,
        pan: form.pan.toUpperCase(),
        ifsc: form.ifsc.toUpperCase(),
        gstin: form.gstRegistered ? form.gstin?.toUpperCase() : undefined,
      });
      const syncData = await api.sync();
      setSync(syncData);
      setDialogOpen(false);
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to create vendor");
    } finally {
      setSaving(false);
    }
  };

  const isValid =
    form.vendorName && form.email && form.ownerName &&
    form.defaultPrepTime > 0 && form.ownerPhone.length === 10 &&
    (form.campusId || form.city) &&
    form.businessName && form.pan.length === 10 &&
    form.bankAccount && form.ifsc.length === 11 &&
    (!form.gstRegistered || (form.gstin && form.gstin.length === 15));

  const filteredVendors = vendors?.filter((v) => {
    if (subFilter === "ALL") return true;
    if (subFilter === "PAST_DUE") return v.subscription.status === "PAST_DUE";
    return v.subscription.status === "ACTIVE";
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vendors</h1>
        <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Vendor</Button>
      </div>

      {/* Subscription filter chips */}
      <div className="flex gap-2 flex-wrap">
        {(["ALL", "ACTIVE", "PAST_DUE"] as SubFilter[]).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={subFilter === f ? "default" : "outline"}
            onClick={() => setSubFilter(f)}
            className="text-xs"
          >
            {f === "ALL" ? "All" : f === "PAST_DUE" ? "Past Due" : "Active"}
          </Button>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Campus</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prep Time</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {!vendors ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell />
                </TableRow>
              ))
            ) : filteredVendors?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                  No vendors match this filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredVendors?.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell>
                    {v.campusName
                      ? <Badge variant="outline" className="text-xs">{v.campusName}</Badge>
                      : <Badge variant="secondary" className="text-xs">General · {v.city}</Badge>
                    }
                  </TableCell>
                  <TableCell>
                    <span className={v.isOpen ? "text-green-600 text-sm font-medium" : "text-muted-foreground text-sm"}>
                      {v.isOpen ? "Open" : "Closed"}
                    </span>
                  </TableCell>
                  <TableCell>{v.prepTime} min</TableCell>
                  <TableCell>
                    {v.accountStatus === "SUSPENDED" ? (
                      <Badge variant="destructive" className="text-xs">Suspended</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-300">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell>{subBadge(v.subscription.status, v.subscription.monthlyPrice)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSubDialogVendor(v)}>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Subscription
                        </DropdownMenuItem>
                        {v.accountStatus !== "SUSPENDED" && (
                          <DropdownMenuItem
                            disabled={uploading && uploadTarget?.id === v.id}
                            onClick={() => handleLogoClick(v)}
                          >
                            <ImageUp className="h-4 w-4 mr-2" />
                            Upload Logo
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {v.accountStatus === "SUSPENDED" ? (
                          <DropdownMenuItem onClick={() => handleReinstate(v)}>
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            Reinstate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => { setSuspendTarget(v); setSuspendNote(""); }}
                          >
                            <ShieldOff className="h-4 w-4 mr-2" />
                            Suspend
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Suspend dialog */}
      <Dialog open={!!suspendTarget} onOpenChange={(open) => { if (!open) setSuspendTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend {suspendTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              This vendor will be blocked from logging in and hidden from customers until reinstated.
            </p>
            <div className="space-y-2">
              <Label>Reason (shown to vendor on login)</Label>
              <Textarea
                value={suspendNote}
                onChange={(e) => setSuspendNote(e.target.value)}
                placeholder="e.g. Repeated order cancellations. Contact admin to resolve."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendTarget(null)}>Cancel</Button>
            <Button onClick={handleSuspend} disabled={!suspendNote.trim() || suspending}>
              {suspending ? "Suspending..." : "Confirm Suspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscription management dialog */}
      {subDialogVendor && (
        <VendorSubscriptionDialog
          vendor={subDialogVendor}
          open={!!subDialogVendor}
          onClose={() => setSubDialogVendor(null)}
        />
      )}

      {/* Add Vendor sheet */}
      <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <SheetTitle className="text-xl">Add Vendor</SheetTitle>
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

            {/* Location */}
            <section className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location</p>
              <div className="space-y-2">
                <Label>Campus <span className="text-muted-foreground font-normal text-xs">(optional)</span></Label>
                <Select
                  value={form.campusId ?? "__none__"}
                  onValueChange={(v) => setForm((f) => ({ ...f, campusId: v === "__none__" ? null : v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="General vendor (no campus)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">General vendor (no campus)</SelectItem>
                    {(campuses ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} <span className="text-muted-foreground ml-1">@{c.emailDomain}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {!form.campusId && (
                <div className="space-y-2">
                  <Label>City <span className="text-destructive">*</span></Label>
                  <Input value={form.city ?? ""} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder="e.g. Bangalore" maxLength={100} />
                </div>
              )}
            </section>

            {/* Contact & Identity */}
            <section className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact & Identity</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vendor Name <span className="text-destructive">*</span></Label>
                  <Input value={form.vendorName} onChange={(e) => setForm((f) => ({ ...f, vendorName: e.target.value }))} placeholder="e.g. Campus Grill" />
                </div>
                <div className="space-y-2">
                  <Label>Owner Name <span className="text-destructive">*</span></Label>
                  <Input value={form.ownerName} onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))} placeholder="Full name" />
                </div>
                <div className="space-y-2">
                  <Label>Owner Email <span className="text-destructive">*</span></Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="vendor@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Phone <span className="text-destructive">*</span></Label>
                  <div className="flex">
                    <span className="flex items-center px-3 bg-muted border border-r-0 border-input rounded-l-md text-sm font-medium text-foreground">+91</span>
                    <Input
                      className="rounded-l-none"
                      value={form.ownerPhone}
                      onChange={(e) => setForm((f) => ({ ...f, ownerPhone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                      placeholder="9876543210"
                      maxLength={10}
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Operations */}
            <section className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Operations & Subscription</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Prep Time <span className="text-destructive">*</span></Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      value={form.defaultPrepTime}
                      onChange={(e) => setForm((f) => ({ ...f, defaultPrepTime: Number(e.target.value) }))}
                    />
                    <span className="text-sm text-muted-foreground shrink-0">min</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Monthly Subscription Fee</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground shrink-0">₹</span>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={form.subscriptionMonthlyPrice ?? 0}
                      onChange={(e) => setForm((f) => ({ ...f, subscriptionMonthlyPrice: Number(e.target.value) }))}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Set to 0 for free plan</p>
                </div>
              </div>
            </section>

            {/* Business & KYC */}
            <section className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Business & KYC</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Business Name <span className="text-destructive">*</span></Label>
                  <Input value={form.businessName} onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))} placeholder="Registered business name" />
                </div>
                <div className="space-y-2">
                  <Label>PAN <span className="text-destructive">*</span></Label>
                  <Input
                    value={form.pan}
                    onChange={(e) => setForm((f) => ({ ...f, pan: e.target.value.toUpperCase().slice(0, 10) }))}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label>IFSC Code <span className="text-destructive">*</span></Label>
                  <Input
                    value={form.ifsc}
                    onChange={(e) => setForm((f) => ({ ...f, ifsc: e.target.value.toUpperCase().slice(0, 11) }))}
                    placeholder="SBIN0001234"
                    maxLength={11}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Bank Account Number <span className="text-destructive">*</span></Label>
                  <Input value={form.bankAccount} onChange={(e) => setForm((f) => ({ ...f, bankAccount: e.target.value }))} placeholder="Account number" inputMode="numeric" />
                </div>
              </div>
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.gstRegistered}
                    onCheckedChange={(checked) => setForm((f) => ({ ...f, gstRegistered: checked, gstin: checked ? f.gstin : "" }))}
                  />
                  <Label className="cursor-pointer">GST Registered</Label>
                </div>
                {form.gstRegistered && (
                  <div className="space-y-2">
                    <Label>GSTIN <span className="text-destructive">*</span></Label>
                    <Input
                      value={form.gstin ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, gstin: e.target.value.toUpperCase().slice(0, 15) }))}
                      placeholder="22ABCDE1234F1Z5"
                      maxLength={15}
                    />
                  </div>
                )}
              </div>
            </section>

          </div>

          <SheetFooter className="px-6 py-4 border-t shrink-0 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={save} disabled={!isValid || saving}>{saving ? "Creating..." : "Create Vendor"}</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
