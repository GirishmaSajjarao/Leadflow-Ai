import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  CheckCircle2,
  Clock,
  IndianRupee,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatCard } from "@/components/dashboard/StatCard";
import { useLeads } from "@/context/LeadsContext";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LEAD_STATUSES } from "@/types";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "oklch(0.6 0.18 320)",
  "oklch(0.5 0.04 260)",
];

function DashboardPage() {
  const { leads, employees } = useLeads();
  const total = leads.length;
  const won = leads.filter((l) => l.status === "Won").length;
  const lost = leads.filter((l) => l.status === "Lost").length;
  const pending = total - won - lost;
  const revenue = leads
    .filter((l) => l.status === "Won")
    .reduce((s, l) => s + l.expectedRevenue, 0);

  // Monthly conversion synthetic from leads
  const monthly = Array.from({ length: 6 }).map((_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (5 - i));
    const label = month.toLocaleString("en", { month: "short" });
    const seed = (i + 1) * 7;
    return {
      month: label,
      leads: 12 + ((seed * 3) % 14),
      won: 4 + ((seed * 2) % 8),
    };
  });

  const statusData = LEAD_STATUSES.map((s) => ({
    name: s,
    value: leads.filter((l) => l.status === s).length,
  })).filter((d) => d.value > 0);

  const teamPerf = employees.slice(1).map((e) => {
    const assigned = leads.filter((l) => l.assignedTo === e.id);
    const wonCount = assigned.filter((l) => l.status === "Won").length;
    return {
      ...e,
      assigned: assigned.length,
      won: wonCount,
      rate: assigned.length ? Math.round((wonCount / assigned.length) * 100) : 0,
    };
  });

  const recent = [...leads]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            A snapshot of your sales pipeline and team performance.
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5 border-success/30 bg-success/10 text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success" /> Live
        </Badge>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total Leads"
          value={total}
          delta="+12% from last month"
          trend="up"
          icon={<Users className="h-4 w-4" />}
          accent="indigo"
        />
        <StatCard
          label="Converted"
          value={won}
          delta={`${total ? Math.round((won / total) * 100) : 0}% win rate`}
          trend="up"
          icon={<CheckCircle2 className="h-4 w-4" />}
          accent="green"
        />
        <StatCard
          label="Pending"
          value={pending}
          delta="In active pipeline"
          icon={<Clock className="h-4 w-4" />}
          accent="amber"
        />
        <StatCard
          label="Revenue"
          value={`₹${(revenue / 100000).toFixed(1)}L`}
          delta="Closed-won this period"
          trend="up"
          icon={<IndianRupee className="h-4 w-4" />}
          accent="cyan"
        />
        <StatCard
          label="Active Employees"
          value={employees.length}
          delta="Across 1 team"
          icon={<Activity className="h-4 w-4" />}
          accent="red"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Monthly Conversion</h2>
              <p className="text-xs text-muted-foreground">Leads vs Won — last 6 months</p>
            </div>
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gWon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  fill="url(#gLeads)"
                />
                <Area
                  type="monotone"
                  dataKey="won"
                  stroke="var(--color-chart-2)"
                  strokeWidth={2}
                  fill="url(#gWon)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold">Lead Status</h2>
          <p className="text-xs text-muted-foreground">Distribution across pipeline</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold">Team Performance</h2>
          <p className="text-xs text-muted-foreground">Win rate by employee</p>
          <div className="mt-4 space-y-3">
            {teamPerf.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-xl border bg-card/60 p-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gradient-brand text-primary-foreground text-xs">
                    {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.assigned} leads · {m.won} won
                  </p>
                </div>
                <div className="w-28">
                  <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Win</span>
                    <span className="font-semibold text-foreground">{m.rate}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-gradient-brand transition-all"
                      style={{ width: `${m.rate}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold">Recent Activity</h2>
          <p className="text-xs text-muted-foreground">Latest leads added to the pipeline</p>
          <div className="mt-4 space-y-2">
            {recent.map((l) => {
              const emp = employees.find((e) => e.id === l.assignedTo);
              return (
                <div key={l.id} className="flex items-center gap-3 rounded-xl border bg-card/60 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground text-xs font-semibold">
                    {l.companyName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{l.companyName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {l.clientName} · assigned to {emp?.name ?? "—"}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {l.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
