import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { UserCog, Trophy, TrendingUp, Users, Mail, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLeads } from "@/context/LeadsContext";
import { EmployeeDialog } from "@/components/employees/EmployeeDialog";
import { EmployeeProfile } from "@/components/employees/EmployeeProfile";
import { toast } from "sonner";
import type { Employee } from "@/types";

export const Route = createFileRoute("/_authenticated/employees")({
  component: EmployeesPage,
});

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("");
}

function EmployeesPage() {
  const { employees, leads, deleteEmployee } = useLeads();
  const [dialog, setDialog] = useState<{ open: boolean; edit?: Employee | null }>({ open: false });
  const [profile, setProfile] = useState<{ open: boolean; employee: Employee | null }>({ open: false, employee: null });
  const [toDelete, setToDelete] = useState<Employee | null>(null);

  const rows = useMemo(() => employees.map((e) => {
    const assigned = leads.filter((l) => l.assignedTo === e.id);
    const won = assigned.filter((l) => l.status === "Won").length;
    const revenue = assigned.filter((l) => l.status === "Won").reduce((s, l) => s + l.expectedRevenue, 0);
    const rate = assigned.length ? Math.round((won / assigned.length) * 100) : 0;
    return { ...e, assigned: assigned.length, won, revenue, rate };
  }), [employees, leads]);

  const top = useMemo(() => [...rows].sort((a, b) => b.revenue - a.revenue).slice(0, 3), [rows]);
  const avgConv = rows.length ? Math.round(rows.reduce((s, r) => s + r.rate, 0) / rows.length) : 0;

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader
        title="Employees"
        description="Team performance, assignments and contribution metrics."
        breadcrumb={[{ label: "Workspace" }, { label: "Employees" }]}
        actions={
          <Button className="bg-gradient-brand text-primary-foreground" onClick={() => setDialog({ open: true, edit: null })}>
            <Plus className="mr-1 h-4 w-4" /> Invite Member
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Team Size", value: employees.length, icon: Users },
          { label: "Avg Conversion", value: `${avgConv}%`, icon: TrendingUp },
          { label: "Top Performer", value: top[0]?.name.split(" ")[0] ?? "—", icon: Trophy },
        ].map((s) => (
          <Card key={s.label} className="glass">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-brand text-primary-foreground">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-semibold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {top.map((e, i) => (
          <Card key={e.id} className="glass cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg" onClick={() => setProfile({ open: true, employee: e })}>
            <CardContent className="flex items-center gap-3 p-4">
              <Avatar className="h-12 w-12 ring-2 ring-primary/30">
                <AvatarFallback className="bg-gradient-brand text-primary-foreground">{initials(e.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">{e.name}</p>
                  {i === 0 && <Badge className="bg-warning/20 text-warning">★ Top</Badge>}
                </div>
                <p className="truncate text-xs text-muted-foreground">{e.email}</p>
                <p className="mt-1 text-xs">
                  <span className="font-semibold">{e.won}</span> wins ·{" "}
                  <span className="font-semibold">₹{(e.revenue / 1000).toFixed(0)}k</span>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserCog className="h-4 w-4" /> Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Assigned</TableHead>
                <TableHead className="text-right">Won</TableHead>
                <TableHead className="text-right">Conversion</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-brand text-primary-foreground text-xs">{initials(r.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{r.name}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{r.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize">{r.role}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.department ?? "—"}</TableCell>
                  <TableCell className="text-right">{r.assigned}</TableCell>
                  <TableCell className="text-right">{r.won}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="border-primary/30 text-primary">{r.rate}%</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">₹{(r.revenue / 1000).toFixed(0)}k</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setProfile({ open: true, employee: r })}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setDialog({ open: true, edit: r })}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setToDelete(r)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EmployeeDialog open={dialog.open} onOpenChange={(o) => setDialog({ open: o, edit: o ? dialog.edit : null })} employee={dialog.edit} />
      <EmployeeProfile open={profile.open} onOpenChange={(o) => setProfile({ open: o, employee: o ? profile.employee : null })} employee={profile.employee} />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove employee?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {toDelete?.name} from the team. Assigned leads will be unlinked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => {
                if (toDelete) { deleteEmployee(toDelete.id); toast.success("Employee removed"); }
                setToDelete(null);
              }}
            >Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
