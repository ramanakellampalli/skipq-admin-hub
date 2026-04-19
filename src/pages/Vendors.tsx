import { useState } from "react";
import { api, type CreateVendorPayload } from "@/lib/api";
import { useAdminStore } from "@/lib/adminStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

const emptyForm: CreateVendorPayload = { vendorName: "", email: "", ownerName: "", defaultPrepTime: 10, campusId: "" };

export default function Vendors() {
  const vendors = useAdminStore((s) => s.vendors);
  const campuses = useAdminStore((s) => s.campuses);
  const setSync = useAdminStore((s) => s.setSync);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateVendorPayload>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const openAdd = () => { setForm(emptyForm); setError(""); setDialogOpen(true); };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await api.createVendor(form);
      const syncData = await api.sync();
      setSync(syncData);
      setDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create vendor");
    } finally {
      setSaving(false);
    }
  };

  const isValid = form.vendorName && form.email && form.ownerName && form.defaultPrepTime > 0 && form.campusId;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vendors</h1>
        <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Vendor</Button>
      </div>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Campus</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prep Time</TableHead>
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
                </TableRow>
              ))
            ) : (
              vendors.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{v.campusName}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={v.isOpen ? "text-green-600 text-sm font-medium" : "text-muted-foreground text-sm"}>
                      {v.isOpen ? "Open" : "Closed"}
                    </span>
                  </TableCell>
                  <TableCell>{v.prepTime} min</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vendor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-2">
              <Label>Campus</Label>
              <Select value={form.campusId} onValueChange={(v) => setForm((f) => ({ ...f, campusId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a campus" />
                </SelectTrigger>
                <SelectContent>
                  {(campuses ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} <span className="text-muted-foreground ml-1">@{c.emailDomain}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
