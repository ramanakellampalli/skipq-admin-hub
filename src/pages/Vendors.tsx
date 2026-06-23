import { useRef, useState } from "react";
import { api, type CreateVendorPayload, type Vendor } from "@/lib/api";
import { useAdminStore } from "@/lib/adminStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUp, Plus } from "lucide-react";

const emptyForm: CreateVendorPayload = {
  vendorName: "", email: "", ownerName: "", defaultPrepTime: 10,
  campusId: null, city: "", ownerPhone: "",
  businessName: "", pan: "", bankAccount: "", ifsc: "",
  gstRegistered: false, gstin: "",
};

export default function Vendors() {
  const vendors = useAdminStore((s) => s.vendors);
  const campuses = useAdminStore((s) => s.campuses);
  const setSync = useAdminStore((s) => s.setSync);
  const updateVendorStatus = useAdminStore((s) => s.updateVendorStatus);
  const updateVendorLogo = useAdminStore((s) => s.updateVendorLogo);
  const approveVendorKyc = useAdminStore((s) => s.approveVendorKyc);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateVendorPayload>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [suspendTarget, setSuspendTarget] = useState<Vendor | null>(null);
  const [suspendNote, setSuspendNote] = useState("");
  const [suspending, setSuspending] = useState(false);

  const [kycTarget, setKycTarget] = useState<Vendor | null>(null);
  const [approvingKyc, setApprovingKyc] = useState(false);

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

  const handleApproveKyc = async () => {
    if (!kycTarget) return;
    setApprovingKyc(true);
    try {
      await api.approveKyc(kycTarget.id);
      approveVendorKyc(kycTarget.id);
      setKycTarget(null);
    } finally {
      setApprovingKyc(false);
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vendors</h1>
        <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Vendor</Button>
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
              <TableHead>KYC</TableHead>
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
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell />
                </TableRow>
              ))
            ) : (
              vendors.map((v) => (
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
                  <TableCell>
                    {v.kycApproved ? (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-300">Approved</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs text-amber-600">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {!v.kycApproved && v.accountStatus !== "SUSPENDED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setKycTarget(v)}
                      >
                        Approve KYC
                      </Button>
                    )}
                    {v.accountStatus !== "SUSPENDED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={uploading && uploadTarget?.id === v.id}
                        onClick={() => handleLogoClick(v)}
                      >
                        <ImageUp className="h-4 w-4" />
                      </Button>
                    )}
                    {v.accountStatus === "SUSPENDED" ? (
                      <Button size="sm" variant="outline" onClick={() => handleReinstate(v)}>Reinstate</Button>
                    ) : (
                      <Button size="sm" onClick={() => { setSuspendTarget(v); setSuspendNote(""); }}>Suspend</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Approve KYC dialog */}
      <Dialog open={!!kycTarget} onOpenChange={(open) => { if (!open) setKycTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve KYC — {kycTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Confirm that you have verified the business name, PAN, bank account, and IFSC for this vendor.
              Once approved, the vendor will be able to receive settlements.
            </p>
            {kycTarget?.businessName && (
              <p className="text-sm"><span className="font-medium">Business:</span> {kycTarget.businessName}</p>
            )}
            {kycTarget?.gstRegistered && kycTarget?.gstin && (
              <p className="text-sm"><span className="font-medium">GSTIN:</span> {kycTarget.gstin}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKycTarget(null)}>Cancel</Button>
            <Button onClick={handleApproveKyc} disabled={approvingKyc}>
              {approvingKyc ? "Approving..." : "Confirm Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* Add Vendor dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="flex flex-col max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Add Vendor</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 -mx-6 px-6 space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="space-y-2">
              <Label>Campus <span className="text-muted-foreground font-normal">(optional)</span></Label>
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
            <div className="space-y-2">
              <Label>Vendor Name</Label>
              <Input value={form.vendorName} onChange={(e) => setForm((f) => ({ ...f, vendorName: e.target.value }))} placeholder="e.g. Campus Grill" />
            </div>
            <div className="space-y-2">
              <Label>Owner Name</Label>
              <Input value={form.ownerName} onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))} placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <Label>Owner Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="vendor@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
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
            <div className="space-y-2">
              <Label>Default Prep Time (minutes)</Label>
              <Input type="number" min={1} value={form.defaultPrepTime} onChange={(e) => setForm((f) => ({ ...f, defaultPrepTime: Number(e.target.value) }))} />
            </div>

            <div className="border-t pt-4 space-y-4">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Business & KYC Details</p>
              <div className="space-y-2">
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
                <Label>Bank Account Number <span className="text-destructive">*</span></Label>
                <Input value={form.bankAccount} onChange={(e) => setForm((f) => ({ ...f, bankAccount: e.target.value }))} placeholder="Account number" inputMode="numeric" />
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!isValid || saving}>{saving ? "Creating..." : "Create Vendor"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
