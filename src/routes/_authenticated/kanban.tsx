import { createFileRoute } from "@tanstack/react-router";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLeads } from "@/context/LeadsContext";
import { KANBAN_COLUMNS, type Lead, type LeadStatus } from "@/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/kanban")({
  component: KanbanPage,
});

const COLUMN_ACCENT: Record<LeadStatus, string> = {
  New: "from-chart-1/20 to-transparent",
  Contacted: "from-chart-2/20 to-transparent",
  Qualified: "from-chart-4/20 to-transparent",
  "Proposal Sent": "from-primary/20 to-transparent",
  Negotiation: "from-accent/30 to-transparent",
  Won: "from-success/20 to-transparent",
  Lost: "from-destructive/20 to-transparent",
};

const PRIORITY_DOT = {
  High: "bg-destructive",
  Medium: "bg-chart-4",
  Low: "bg-muted-foreground/50",
};

function KanbanPage() {
  const { leads, setStatus, employees } = useLeads();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const byStatus = useMemo(() => {
    const map = new Map<LeadStatus, Lead[]>();
    KANBAN_COLUMNS.forEach((c) => map.set(c.id, []));
    leads.forEach((l) => {
      if (map.has(l.status)) map.get(l.status)!.push(l);
    });
    return map;
  }, [leads]);

  const activeLead = leads.find((l) => l.id === activeId) ?? null;

  const handleDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const newStatus = String(over.id) as LeadStatus;
    const lead = leads.find((l) => l.id === active.id);
    if (lead && lead.status !== newStatus) {
      setStatus(lead.id, newStatus);
      toast.success(`Moved "${lead.companyName}" to ${newStatus}`);
    }
  };

  return (
    <div className="flex h-full flex-col space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Pipeline</h1>
        <p className="text-sm text-muted-foreground">
          Drag leads between columns to update their status.
        </p>
      </header>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid flex-1 gap-4 overflow-x-auto pb-4 [grid-template-columns:repeat(5,minmax(260px,1fr))]">
          {KANBAN_COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              count={byStatus.get(col.id)?.length ?? 0}
            >
              {(byStatus.get(col.id) ?? []).map((lead) => {
                const emp = employees.find((e) => e.id === lead.assignedTo);
                return <KanbanCard key={lead.id} lead={lead} empName={emp?.name} />;
              })}
              {(byStatus.get(col.id)?.length ?? 0) === 0 && (
                <div className="rounded-xl border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
                  Drop leads here
                </div>
              )}
            </KanbanColumn>
          ))}
        </div>

        <DragOverlay>
          {activeLead && (
            <div className="rotate-2">
              <CardContent lead={activeLead} empName={employees.find((e) => e.id === activeLead.assignedTo)?.name} dragging />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function KanbanColumn({
  id,
  title,
  count,
  children,
}: {
  id: LeadStatus;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "glass flex min-h-[400px] flex-col rounded-2xl bg-gradient-to-b p-3 transition-colors",
        COLUMN_ACCENT[id],
        isOver && "ring-2 ring-primary/50",
      )}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{title}</h3>
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
            {count}
          </Badge>
        </div>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function KanbanCard({ lead, empName }: { lead: Lead; empName?: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead.id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab touch-none active:cursor-grabbing",
        isDragging && "opacity-30",
      )}
    >
      <CardContent lead={lead} empName={empName} />
    </div>
  );
}

function CardContent({
  lead,
  empName,
  dragging,
}: {
  lead: Lead;
  empName?: string;
  dragging?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
        dragging && "shadow-xl",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold leading-tight">{lead.companyName}</p>
        <span
          className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", PRIORITY_DOT[lead.priority])}
          title={`${lead.priority} priority`}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{lead.clientName}</p>
      <div className="mt-3 flex items-center justify-between">
        <Badge variant="outline" className="text-[10px]">
          {lead.industry}
        </Badge>
        <span className="text-xs font-semibold text-primary">
          ₹{(lead.expectedRevenue / 1000).toFixed(0)}k
        </span>
      </div>
      {empName && (
        <div className="mt-3 flex items-center gap-2 border-t pt-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-secondary text-[10px]">
              {empName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <span className="text-[11px] text-muted-foreground">{empName}</span>
        </div>
      )}
    </div>
  );
}
