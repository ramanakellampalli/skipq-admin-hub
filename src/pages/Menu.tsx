import { useEffect, useState } from "react";
import { api, type Vendor, type MenuItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil } from "lucide-react";

export default function Menu() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>("");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState({ name: "", price: 0, category: "" });

  useEffect(() => { api.getVendors().then(setVendors); }, []);

  useEffect(() => {
    if (!selectedVendor) return;
    setLoading(true);
    api.getMenuItems(selectedVendor).then((m) => { setItems(m); setLoading(false); });
  }, [selectedVendor]);

  const openAdd = () => { setEditing(null); setForm({ name: "", price: 0, category: "" }); setDialogOpen(true); };
  const openEdit = (m: MenuItem) => { setEditing(m); setForm({ name: m.name, price: m.price, category: m.category }); setDialogOpen(true); };

  const save = async () => {
    if (editing) {
      await api.updateMenuItem(editing.id, { name: form.name, price: form.price, category: form.category });
    } else {
      await api.addMenuItem({ vendorId: selectedVendor, name: form.name, price: form.price, category: form.category, available: true });
    }
    setDialogOpen(false);
    api.getMenuItems(selectedVendor).then(setItems);
  };

  const toggleAvailability = async (m: MenuItem) => {
    await api.updateMenuItem(m.id, { available: !m.available });
    api.getMenuItems(selectedVendor).then(setItems);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Menu Management</h1>
        {selectedVendor && <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Item</Button>}
      </div>

      <Select value={selectedVendor} onValueChange={setSelectedVendor}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Select a vendor" />
        </SelectTrigger>
        <SelectContent>
          {vendors.map((v) => (
            <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedVendor && (
        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Available</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-20" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No menu items yet</TableCell></TableRow>
              ) : (
                items.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell className="text-muted-foreground">{m.category}</TableCell>
                    <TableCell>${m.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Switch checked={m.available} onCheckedChange={() => toggleAvailability(m)} />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Item" : "Add Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Item name" />
            </div>
            <div className="space-y-2">
              <Label>Price</Label>
              <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="e.g. Burgers, Drinks" />
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
