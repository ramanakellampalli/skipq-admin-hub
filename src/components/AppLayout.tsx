import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/lib/auth";
import { useAdminStore } from "@/lib/adminStore";
import { api } from "@/lib/api";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const user = useAuth((s) => s.user);
  const isSynced = useAdminStore((s) => s.isSynced);
  const setSync = useAdminStore((s) => s.setSync);
  const { showWarning, secondsLeft, extend, logout } = useIdleTimeout();

  useEffect(() => {
    if (!isSynced) {
      api.sync().then(setSync).catch(() => {});
    }
  }, [isSynced, setSync]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border px-4 shrink-0">
            <SidebarTrigger />
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{user?.email}</span>
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                {user?.name?.charAt(0) ?? "A"}
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>

      <Dialog open={showWarning}>
        <DialogContent className="max-w-sm" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Session about to expire</DialogTitle>
            <DialogDescription>
              You've been inactive. You'll be logged out in{" "}
              <span className="font-semibold text-destructive">{secondsLeft}s</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={logout}>Log out now</Button>
            <Button onClick={extend}>Stay logged in</Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
