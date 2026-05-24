import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TrendingUp, IndianRupee, Target, Activity, Download, Clock } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExportDialog, type AnalyticsExportData } from "@/components/analytics/ExportDialog";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

export const Route = createFileRoute("/_authenticated/analytics")({
  component: AnalyticsPage,
});

const revenue = [
  { m: "Jan", revenue: 240, target: 220 },
  { m: "Feb", revenue: 280, target: 250 },
  { m: "Mar", revenue: 310, target: 280 },
  { m: "Apr", revenue: 360, target: 320 },
  { m: "May", revenue: 420, target: 360 },
  { m: "Jun", revenue: 480, target: 400 },
];

const conv = [
  { stage: "Leads", count: 320 },
  { stage: "Qualified", count: 210 },
  { stage: "Proposal", count: 140 },
  { stage: "Negotiation", count: 80 },
  { stage: "Won", count: 52 },
];

const KPIS = [
  { label: "Total Revenue", value: "₹24.8L", delta: "+12.4%", icon: IndianRupee },
  { label: "Conversion Rate", value: "32.1%", delta: "+3.2%", icon: Target },
  { label: "Active Pipeline", value: "₹38.2L", delta: "+8.1%", icon: Activity },
  { label: "Growth (QoQ)", value: "18.7%", delta: "+2.0%", icon: TrendingUp },
];
const INSIGHTS = [
  { t: "Avg Deal Size", v: "₹4.8L", d: "Across 52 won deals" },
  { t: "Avg Sales Cycle", v: "21 days", d: "Lead → Won" },
  { t: "Top Industry", v: "Automotive", d: "38% of pipeline" },
];

function AnalyticsPage() {
  const [exportOpen, setExportOpen] = useState(false);
  const [lastExport, setLastExport] = useState<{ filename: string; at: string } | null>(null);

  const exportData: AnalyticsExportData = {
    kpis: KPIS.map((k) => ({ label: k.label, value: k.value })),
    revenue,
    funnel: conv,
    meta: INSIGHTS.map((i) => ({ label: i.t, value: `${i.v} — ${i.d}` })),
  };

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader
        title="Analytics"
        description="Pipeline health, conversion funnel and revenue trends."
        breadcrumb={[{ label: "Insights" }, { label: "Analytics" }]}
        actions={
          <div className="flex items-center gap-2">
            {lastExport && (
              <Badge variant="outline" className="hidden gap-1 sm:flex">
                <Clock className="h-3 w-3" /> Last: {new Date(lastExport.at).toLocaleTimeString()}
              </Badge>
            )}
            <Button variant="outline" onClick={() => setExportOpen(true)}>
              <Download className="mr-1 h-4 w-4" /> Export Report
            </Button>
          </div>
        }
      />


      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((k) => (
          <Card key={k.label} className="glass">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <k.icon className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-1 text-2xl font-bold">{k.value}</p>
              <p className="text-xs text-success">{k.delta} vs last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="glass lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Revenue vs Target</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue}>
                <defs>
                  <linearGradient id="rev" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Legend />
                <Area type="monotone" dataKey="target" stroke="var(--accent)" fill="transparent" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base">Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conv} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis type="category" dataKey="stage" stroke="var(--muted-foreground)" fontSize={12} width={80} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="count" fill="var(--primary)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INSIGHTS.map((w) => (
          <Card key={w.t} className="glass">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{w.t}</p>
              <p className="mt-1 text-xl font-semibold text-gradient-brand">{w.v}</p>
              <p className="text-xs text-muted-foreground">{w.d}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        data={exportData}
        onExported={(info) => setLastExport({ filename: info.filename, at: info.at })}
      />
    </div>
  );
}

