import { useMemo, useState } from "react";
import { api, type ServiceRequest, type ServiceRequestStatus } from "@/lib/api";
import { useAdminStore } from "@/lib/adminStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type TabStatus = ServiceRequestStatus | "ALL";

const STATUS_COLORS: Record<ServiceRequestStatus, string> = {
  OPEN:        "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  RESOLVED:    "bg-green-100 text-green-800",
  CLOSED:      "bg-muted text-muted-foreground",
};

const TYPE_LABELS: Record<string, string> = {
  REFUND_ISSUE:  "Refund",
  PAYMENT_ISSUE: "Payment",
  ACCOUNT_ISSUE: "Account",
  BILLING_ISSUE: "Billing",
  PAYOUT_ISSUE:  "Payout",
  TECHNICAL:     "Technical",
  OTHER:         "Other",
};

function StatusBadge({ status }: { status: ServiceRequestStatus }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });
}

export default function Support() {
  const serviceRequests = useAdminStore((s) => s.serviceRequests);
  const updateInStore = useAdminStore((s) => s.updateServiceRequest);

  const [tab, setTab] = useState<TabStatus>("OPEN");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selected, setSelected] = useState<ServiceRequest | null>(null);

  const [editStatus, setEditStatus] = useState<ServiceRequestStatus>("OPEN");
  const [editResponse, setEditResponse] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const openSheet = (sr: ServiceRequest) => {
    setSelected(sr);
    setEditStatus(sr.status);
    setEditResponse(sr.adminResponse ?? "");
    setEditNotes(sr.adminNotes ?? "");
  };

  const closeSheet = () => setSelected(null);

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await api.updateServiceRequest(selected.id, {
        status: editStatus,
        adminResponse: editResponse || undefined,
        adminNotes: editNotes || undefined,
      });
      updateInStore(updated);
      setSelected(updated);
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    if (!serviceRequests) return null;
    return serviceRequests.filter((sr) => {
      const matchesTab = tab === "ALL" || sr.status === tab;
      const matchesRole = roleFilter === "all" || sr.role === roleFilter;
      return matchesTab && matchesRole;
    });
  }, [serviceRequests, tab, roleFilter]);

  const counts = useMemo(() => {
    if (!serviceRequests) return { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, CLOSED: 0, ALL: 0 };
    return {
      ALL:         serviceRequests.length,
      OPEN:        serviceRequests.filter((s) => s.status === "OPEN").length,
      IN_PROGRESS: serviceRequests.filter((s) => s.status === "IN_PROGRESS").length,
      RESOLVED:    serviceRequests.filter((s) => s.status === "RESOLVED").length,
      CLOSED:      serviceRequests.filter((s) => s.status === "CLOSED").length,
    };
  }, [serviceRequests]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Support Requests</h1>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabStatus)}>
          <TabsList>
            {(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "ALL"] as TabStatus[]).map((s) => (
              <TabsTrigger key={s} value={s}>
                {s === "IN_PROGRESS" ? "In Progress" : s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                {serviceRequests && (
                  <span className="ml-1.5 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                    {counts[s]}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="VENDOR">Vendor</SelectItem>
            <SelectItem value="STUDENT">Student</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!filtered ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-20" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  No requests.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((sr) => (
                <TableRow key={sr.id} className="cursor-pointer hover:bg-muted/30" onClick={() => openSheet(sr)}>
                  <TableCell>
                    <div className="font-medium text-sm">{sr.userName}</div>
                    <div className="text-xs text-muted-foreground">{sr.userEmail}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{sr.role}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{TYPE_LABELS[sr.type] ?? sr.type}</TableCell>
                  <TableCell className="max-w-56 truncate text-sm">{sr.description}</TableCell>
                  <TableCell><StatusBadge status={sr.status} /></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(sr.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!selected} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {selected && (() => {
            const isClosed = selected.status === "CLOSED";
            return (
              <>
                <SheetHeader>
                  <SheetTitle>{TYPE_LABELS[selected.type] ?? selected.type}</SheetTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{selected.role}</Badge>
                    <span className="text-xs text-muted-foreground">{selected.userEmail}</span>
                  </div>
                </SheetHeader>

                <div className="mt-6 space-y-5">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">From</span>
                    <p className="text-sm font-medium">{selected.userName}</p>
                    <p className="text-xs text-muted-foreground">{selected.userEmail}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Submitted</span>
                    <p className="text-sm">{formatDate(selected.createdAt)}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Description</span>
                    <p className="text-sm whitespace-pre-wrap">{selected.description}</p>
                  </div>

                  <Separator />

                  {isClosed ? (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Status</span>
                        <p className="text-sm font-medium">Closed</p>
                      </div>
                      {selected.adminResponse && (
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">Response to user</span>
                          <p className="text-sm whitespace-pre-wrap">{selected.adminResponse}</p>
                        </div>
                      )}
                      {selected.adminNotes && (
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">Internal notes</span>
                          <p className="text-sm whitespace-pre-wrap">{selected.adminNotes}</p>
                        </div>
                      )}
                      {selected.adminRespondedAt && (
                        <p className="text-xs text-muted-foreground">
                          Responded {formatDate(selected.adminRespondedAt)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={editStatus} onValueChange={(v) => setEditStatus(v as ServiceRequestStatus)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OPEN">Open</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="RESOLVED">Resolved</SelectItem>
                            <SelectItem value="CLOSED">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Response to user</Label>
                        <Textarea
                          rows={4}
                          placeholder="Visible to the user in the app…"
                          value={editResponse}
                          onChange={(e) => setEditResponse(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Internal notes</Label>
                        <Textarea
                          rows={3}
                          placeholder="Not visible to the user…"
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                        />
                      </div>

                      {selected.adminRespondedAt && (
                        <p className="text-xs text-muted-foreground">
                          Last responded {formatDate(selected.adminRespondedAt)}
                        </p>
                      )}

                      <Button className="w-full" onClick={save} disabled={saving}>
                        {saving ? "Saving…" : "Save"}
                      </Button>
                    </>
                  )}
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}
