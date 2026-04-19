import { useState } from "react";
import { api, type CreateCampusPayload } from "@/lib/api";
import { useAdminStore } from "@/lib/adminStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";

const emptyForm: CreateCampusPayload = { name: "", emailDomain: "" };

export default function Campuses() {
  const campuses = useAdminStore((s) => s.campuses);
  const setSync = useAdminStore((s) => s.setSync);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateCampusPayload>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const openAdd = () => { setForm(emptyForm); setError(""); setDialogOpen(true); };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await api.createCampus(form);
      const syncData = await api.sync();
      setSync(syncData);
      setDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create campus");
    } finally {
      setSaving(false);
    }
  };

  const isValid = form.name.trim() && form.emailDomain.trim();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Campuses</h1>
        <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Campus</Button>
      </div>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campus Name</TableHead>
              <TableHead>Email Domain</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!campuses ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                </TableRow>
              ))
            ) : campuses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                  No campuses yet. Add your first campus to get started.
                </TableCell>
              </TableRow>
            ) : (
              campuses.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">@{c.emailDomain}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Campus</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-2">
              <Label>Campus Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. SRM AP"
              />
            </div>
            <div className="space-y-2">
              <Label>Email Domain</Label>
              <Input
                value={form.emailDomain}
                onChange={(e) => setForm((f) => ({ ...f, emailDomain: e.target.value }))}
                placeholder="e.g. srmap.edu.in"
              />
              <p className="text-xs text-muted-foreground">
                Students registering with this domain will be automatically linked to this campus.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!isValid || saving}>
              {saving ? "Creating..." : "Add Campus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
