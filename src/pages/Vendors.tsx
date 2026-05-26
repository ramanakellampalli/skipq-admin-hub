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
import { ImageUp, Plus } from "lucide-react";

const emptyForm: CreateVendorPayload = {
  vendorName: "", email: "", ownerName: "", defaultPrepTime: 10,
  campusId: null, city: "", ownerPhone: "",
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
      await api.createVendor(form);
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
    form.defaultPrepTime > 0 && form.ownerPhone &&
    (form.campusId || form.city);

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
                  <TableCell className="text-right space-x-2">
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vendor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
              <Input value={form.ownerPhone} onChange={(e) => setForm((f) => ({ ...f, ownerPhone: e.target.value }))} placeholder="+91 98765 43210" maxLength={20} />
            </div>
            <div className="space-y-2">
              <Label>Default Prep Time (minutes)</Label>
              <Input type="number" min={1} value={form.defaultPrepTime} onChange={(e) => setForm((f) => ({ ...f, defaultPrepTime: Number(e.target.value) }))} />
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
