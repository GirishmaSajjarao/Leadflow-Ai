import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Filter, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LeadDialog } from "@/components/leads/LeadDialog";
import { useLeads } from "@/context/LeadsContext";
import { LEAD_STATUSES, type Lead, type LeadStatus } from "@/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/leads")({
  component: LeadsPage,
});

const STATUS_STYLES: Record<LeadStatus, string> = {
  New: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  Contacted: "bg-chart-2/15 text-chart-2 border-chart-2/30",
  Qualified: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  "Proposal Sent": "bg-primary/15 text-primary border-primary/30",
  Negotiation: "bg-accent/30 text-accent-foreground border-accent/40",
  Won: "bg-success/15 text-success border-success/30",
  Lost: "bg-destructive/15 text-destructive border-destructive/30",
};

const PRIORITY_STYLES = {
  High: "bg-destructive/15 text-destructive border-destructive/30",
  Medium: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  Low: "bg-muted text-muted-foreground border-border",
};

function LeadsPage() {
  const { leads, employees, deleteLead } = useLeads();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [priority, setPriority] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Lead | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return leads.filter((l) => {
      if (status !== "all" && l.status !== status) return false;
      if (priority !== "all" && l.priority !== priority) return false;
      if (!q) return true;
      return (
        l.companyName.toLowerCase().includes(q) ||
        l.clientName.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.industry.toLowerCase().includes(q)
      );
    });
  }, [leads, query, status, priority]);

  const exportCsv = () => {
    const headers = [
      "Company", "Client", "Phone", "Email", "Industry", "Source",
      "Status", "Priority", "Expected Revenue", "Follow-up",
    ];
    const rows = filtered.map((l) => [
      l.companyName, l.clientName, l.phone, l.email, l.industry, l.source,
      l.status, l.priority, l.expectedRevenue, l.followUpDate?.slice(0, 10) ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Leads</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} of {leads.length} leads
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
            className="bg-gradient-brand text-primary-foreground hover:opacity-90"
          >
            <Plus className="mr-2 h-4 w-4" /> New lead
          </Button>
        </div>
      </header>

      <div className="glass rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by company, client, email..."
              className="pl-9"
            />
          </div>
          <Filter className="ml-1 hidden h-4 w-4 text-muted-foreground sm:block" />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60 bg-muted/40 hover:bg-muted/40">
              <TableHead>Company</TableHead>
              <TableHead>Client</TableHead>
              <TableHead className="hidden md:table-cell">Industry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Priority</TableHead>
              <TableHead className="hidden lg:table-cell">Assigned</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center">
                  <p className="text-sm font-medium">No leads found</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Try adjusting your filters or create a new lead.
                  </p>
                </TableCell>
              </TableRow>
            )}
            {filtered.map((l) => {
              const emp = employees.find((e) => e.id === l.assignedTo);
              return (
                <TableRow key={l.id} className="border-border/60">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand text-xs font-semibold text-primary-foreground">
                        {l.companyName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{l.companyName}</p>
                        <p className="truncate text-xs text-muted-foreground">{l.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{l.clientName}</p>
                    <p className="text-xs text-muted-foreground">{l.phone}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{l.industry}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("font-medium", STATUS_STYLES[l.status])}>
                      {l.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge variant="outline" className={cn(PRIORITY_STYLES[l.priority])}>
                      {l.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {emp && (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-secondary text-xs">
                            {emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{emp.name.split(" ")[0]}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{(l.expectedRevenue / 1000).toFixed(0)}k
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditing(l);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setConfirmDelete(l)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <LeadDialog open={dialogOpen} onOpenChange={setDialogOpen} lead={editing} />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove "{confirmDelete?.companyName}" from your pipeline.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmDelete) {
                  deleteLead(confirmDelete.id);
                  toast.success("Lead deleted");
                  setConfirmDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
