import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Truck, Package, MapPin, CheckCircle2, Clock, AlertCircle, Plus, Pencil, Trash2, Eye, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLeads } from "@/context/LeadsContext";
import { DispatchDialog } from "@/components/dispatch/DispatchDialog";
import { DispatchDetails } from "@/components/dispatch/DispatchDetails";
import { progressForStatus, statusVariant } from "@/lib/dispatch-utils";
import { toast } from "sonner";
import type { Dispatch } from "@/types";

export const Route = createFileRoute("/_authenticated/dispatch")({
  component: DispatchPage,
});

function DispatchPage() {
  const { dispatches, deleteDispatch } = useLeads();
  const [dialog, setDialog] = useState<{ open: boolean; edit?: Dispatch | null }>({ open: false });
  const [details, setDetails] = useState<{ open: boolean; dispatch: Dispatch | null }>({ open: false, dispatch: null });
  const [toDelete, setToDelete] = useState<Dispatch | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return dispatches.filter((d) =>
      !q || d.id.toLowerCase().includes(q) || d.client.toLowerCase().includes(q) ||
      d.orderId.toLowerCase().includes(q) || d.status.toLowerCase().includes(q),
    );
  }, [dispatches, query]);

  const stats = useMemo(() => ({
    active: dispatches.filter((d) => ["Pending", "Processing", "Packed", "In Transit"].includes(d.status)).length,
    delivered: dispatches.filter((d) => d.status === "Delivered").length,
    pending: dispatches.filter((d) => d.status === "Pending").length,
    delayed: dispatches.filter((d) => d.status === "Delayed").length,
  }), [dispatches]);

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader
        title="Dispatch"
        description="Track shipments, dispatch schedule and delivery progress."
        breadcrumb={[{ label: "Operations" }, { label: "Dispatch" }]}
        actions={
          <Button className="bg-gradient-brand text-primary-foreground" onClick={() => setDialog({ open: true, edit: null })}>
            <Plus className="mr-1 h-4 w-4" /> New Dispatch
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Shipments", value: stats.active, icon: Truck, tone: "text-primary" },
          { label: "Delivered", value: stats.delivered, icon: CheckCircle2, tone: "text-success" },
          { label: "Pending Pickup", value: stats.pending, icon: Clock, tone: "text-accent-foreground" },
          { label: "Delayed", value: stats.delayed, icon: AlertCircle, tone: "text-destructive" },
        ].map((s) => (
          <Card key={s.label} className="glass">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-background/60 ${s.tone}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-semibold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search shipments…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => {
          const progress = progressForStatus(s.status);
          return (
            <Card key={s.id} className="glass transition-all hover:-translate-y-0.5 hover:shadow-lg animate-in fade-in">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{s.id}</CardTitle>
                    <p className="text-xs text-muted-foreground">{s.client} · {s.productType}</p>
                  </div>
                  <Badge variant="outline" className={statusVariant(s.status)}>{s.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Package className="h-3 w-3" /> {s.items} items</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> ETA {s.deliveryDate}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-gradient-brand transition-all duration-700" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex items-center gap-1 pt-1">
                  <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setDetails({ open: true, dispatch: s })}>
                    <Eye className="mr-1 h-3.5 w-3.5" /> View
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setDialog({ open: true, edit: s })}>
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 px-2 text-destructive hover:text-destructive" onClick={() => setToDelete(s)}>
                    <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card className="glass sm:col-span-2 lg:col-span-3">
            <CardContent className="flex flex-col items-center justify-center gap-2 p-12 text-center">
              <Truck className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">No shipments found</p>
              <p className="text-xs text-muted-foreground">Create a new dispatch to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <DispatchDialog open={dialog.open} onOpenChange={(o) => setDialog({ open: o, edit: o ? dialog.edit : null })} dispatch={dialog.edit} />
      <DispatchDetails open={details.open} onOpenChange={(o) => setDetails({ open: o, dispatch: o ? details.dispatch : null })} dispatch={details.dispatch} />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete dispatch?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {toDelete?.id} ({toDelete?.client}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => {
                if (toDelete) { deleteDispatch(toDelete.id); toast.success("Dispatch deleted"); }
                setToDelete(null);
              }}
            >Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
