import { useEffect, useState } from "react";
import { api, type Vendor } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil } from "lucide-react";

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [form, setForm] = useState({ name: "", prepTime: 10 });

  const load = () => api.getVendors().then((v) => { setVendors(v); setLoading(false); });
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: "", prepTime: 10 }); setDialogOpen(true); };
  const openEdit = (v: Vendor) => { setEditing(v); setForm({ name: v.name, prepTime: v.prepTime }); setDialogOpen(true); };

  const save = async () => {
    if (editing) {
      await api.updateVendor(editing.id, { name: form.name, prepTime: form.prepTime });
    } else {
      await api.addVendor({ name: form.name, prepTime: form.prepTime, status: "open" });
    }
    setDialogOpen(false);
    load();
  };

  const toggleStatus = async (v: Vendor) => {
    await api.updateVendor(v.id, { status: v.status === "open" ? "closed" : "open" });
    load();
  };

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
              <TableHead>Status</TableHead>
              <TableHead>Prep Time</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                </TableRow>
              ))
            ) : (
              vendors.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={v.status === "open"} onCheckedChange={() => toggleStatus(v)} />
                      <span className={v.status === "open" ? "text-status-ready text-sm" : "text-muted-foreground text-sm"}>
                        {v.status === "open" ? "Open" : "Closed"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{v.prepTime} min</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(v)}><Pencil className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Vendor" : "Add Vendor"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Vendor name" />
            </div>
            <div className="space-y-2">
              <Label>Prep Time (minutes)</Label>
              <Input type="number" value={form.prepTime} onChange={(e) => setForm((f) => ({ ...f, prepTime: Number(e.target.value) }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.name}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
