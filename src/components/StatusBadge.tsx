import type { OrderStatus } from "@/lib/api";
import { cn } from "@/lib/utils";

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-status-pending/20 text-status-pending border-status-pending/30" },
  ACCEPTED: { label: "Accepted", className: "bg-status-accepted/20 text-status-accepted border-status-accepted/30" },
  PREPARING: { label: "Preparing", className: "bg-status-preparing/20 text-status-preparing border-status-preparing/30" },
  READY: { label: "Ready", className: "bg-status-ready/20 text-status-ready border-status-ready/30" },
  COMPLETED: { label: "Completed", className: "bg-muted text-muted-foreground border-muted-foreground/20" },
  REJECTED: { label: "Rejected", className: "bg-destructive/10 text-destructive border-destructive/30" },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status];
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border", config.className)}>
      {config.label}
    </span>
  );
}
