import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Package, User, Calendar, FileText, Clock } from "lucide-react";
import type { Dispatch } from "@/types";
import { progressForStatus, statusVariant } from "@/lib/dispatch-utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  dispatch: Dispatch | null;
}

export function DispatchDetails({ open, onOpenChange, dispatch }: Props) {
  if (!dispatch) return null;
  const progress = progressForStatus(dispatch.status);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" /> {dispatch.id}
          </SheetTitle>
          <SheetDescription>{dispatch.orderId} · {dispatch.productType}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div className="rounded-xl border bg-card/50 p-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className={statusVariant(dispatch.status)}>{dispatch.status}</Badge>
              <span className="text-xs text-muted-foreground">{progress}% complete</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full bg-gradient-brand transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <Info icon={User} label="Client" value={dispatch.client} />
            <Info icon={Package} label="Items" value={`${dispatch.items}`} />
            <Info icon={Calendar} label="Delivery" value={dispatch.deliveryDate} />
            <Info icon={Truck} label="Vehicle" value={dispatch.vehicle} />
            <Info icon={User} label="Manager" value={dispatch.manager} />
            <Info icon={MapPin} label="Order" value={dispatch.orderId} />
          </div>

          {dispatch.notes && (
            <div className="rounded-xl border bg-card/50 p-4">
              <p className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <FileText className="h-3 w-3" /> Notes
              </p>
              <p className="text-sm">{dispatch.notes}</p>
            </div>
          )}

          <div>
            <p className="mb-2 flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Clock className="h-3 w-3" /> Shipment Timeline
            </p>
            <ol className="relative space-y-4 border-l border-border pl-5">
              {dispatch.timeline.slice().reverse().map((t, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[26px] h-3 w-3 rounded-full bg-gradient-brand" />
                  <p className="text-xs text-muted-foreground">{new Date(t.at).toLocaleString()}</p>
                  <p className="text-sm font-medium">{t.label}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card/40 p-3">
      <p className="flex items-center gap-1 text-xs text-muted-foreground"><Icon className="h-3 w-3" /> {label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}
