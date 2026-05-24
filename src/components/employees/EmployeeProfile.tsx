import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Building2, Target, TrendingUp, IndianRupee, Briefcase, Calendar } from "lucide-react";
import { useLeads } from "@/context/LeadsContext";
import type { Employee } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  employee: Employee | null;
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("");
}

export function EmployeeProfile({ open, onOpenChange, employee }: Props) {
  const { leads } = useLeads();
  if (!employee) return null;

  const assigned = leads.filter((l) => l.assignedTo === employee.id);
  const won = assigned.filter((l) => l.status === "Won");
  const revenue = won.reduce((s, l) => s + l.expectedRevenue, 0);
  const rate = assigned.length ? Math.round((won.length / assigned.length) * 100) : 0;
  const targetPct = employee.target ? Math.min(100, Math.round((revenue / employee.target) * 100)) : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14 ring-2 ring-primary/30">
              <AvatarFallback className="bg-gradient-brand text-primary-foreground text-lg">{initials(employee.name)}</AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle>{employee.name}</SheetTitle>
              <SheetDescription className="capitalize">{employee.role} · {employee.department ?? "—"}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <Stat icon={Briefcase} label="Assigned" value={assigned.length} />
            <Stat icon={TrendingUp} label="Won" value={won.length} />
            <Stat icon={Target} label="Conversion" value={`${rate}%`} />
            <Stat icon={IndianRupee} label="Revenue" value={`₹${(revenue / 1000).toFixed(0)}k`} />
          </div>

          {employee.target ? (
            <div className="rounded-xl border bg-card/50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Target progress</span>
                <span className="text-muted-foreground">{targetPct}% of ₹{(employee.target / 100000).toFixed(1)}L</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-gradient-brand transition-all duration-700" style={{ width: `${targetPct}%` }} />
              </div>
            </div>
          ) : null}

          <div className="space-y-2 rounded-xl border bg-card/50 p-4 text-sm">
            <Row icon={Mail} label="Email" value={employee.email} />
            <Row icon={Phone} label="Phone" value={employee.phone ?? "—"} />
            <Row icon={Building2} label="Department" value={employee.department ?? "—"} />
            <Row icon={Calendar} label="Joined" value={employee.joinedAt ?? "—"} />
            <Row icon={Briefcase} label="Status" value={
              <Badge variant="outline" className="capitalize">{employee.status ?? "Active"}</Badge>
            } />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Recent Activity</p>
            <ol className="space-y-2">
              {assigned.slice(0, 5).map((l) => (
                <li key={l.id} className="flex items-center justify-between rounded-lg border bg-card/40 p-3 text-sm">
                  <div>
                    <p className="font-medium">{l.companyName}</p>
                    <p className="text-xs text-muted-foreground">{l.industry} · {l.status}</p>
                  </div>
                  <span className="text-xs font-semibold">₹{(l.expectedRevenue / 1000).toFixed(0)}k</span>
                </li>
              ))}
              {assigned.length === 0 && <p className="text-xs text-muted-foreground">No assigned leads yet.</p>}
            </ol>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <div className="rounded-xl border bg-card/50 p-3">
      <p className="flex items-center gap-1 text-xs text-muted-foreground"><Icon className="h-3 w-3" /> {label}</p>
      <p className="mt-0.5 text-lg font-semibold">{value}</p>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
