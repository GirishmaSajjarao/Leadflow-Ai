import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, CheckCheck, Mail, AlertCircle, TrendingUp, UserPlus, Package } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/notifications")({
  component: NotificationsPage,
});

const initial = [
  { id: 1, icon: TrendingUp, title: "Deal moved to Negotiation", desc: "Apex Industries — ₹6.2L expected", time: "5m ago", read: false, tone: "text-primary" },
  { id: 2, icon: UserPlus, title: "New lead assigned to you", desc: "Bluewave Components from LinkedIn", time: "32m ago", read: false, tone: "text-accent-foreground" },
  { id: 3, icon: Package, title: "Dispatch DSP-1040 delivered", desc: "Signed by R. Mehta", time: "2h ago", read: false, tone: "text-success" },
  { id: 4, icon: AlertCircle, title: "Follow-up overdue", desc: "Crestline Mfg — 3 days pending", time: "Yesterday", read: true, tone: "text-destructive" },
  { id: 5, icon: Mail, title: "Proposal viewed by client", desc: "Greenline Pharma opened your email", time: "2 days ago", read: true, tone: "text-primary" },
];

function NotificationsPage() {
  const [items, setItems] = useState(initial);
  const unread = items.filter((i) => !i.read).length;

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader
        title="Notifications"
        description="Updates from your pipeline, team and dispatch operations."
        breadcrumb={[{ label: "Notifications" }]}
        actions={
          <Button variant="outline" onClick={() => setItems(items.map((i) => ({ ...i, read: true })))}>
            <CheckCheck className="mr-1 h-4 w-4" /> Mark all read
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="glass lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4" /> Inbox
              {unread > 0 && <Badge className="bg-gradient-brand text-primary-foreground">{unread} new</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {items.map((n) => (
              <div
                key={n.id}
                className={`group flex items-start gap-3 rounded-xl border p-3 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                  n.read ? "bg-background/40 border-border" : "bg-primary/5 border-primary/20"
                }`}
              >
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background/70 ${n.tone}`}>
                  <n.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{n.title}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">{n.time}</span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{n.desc}</p>
                </div>
                {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base">Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="relative space-y-5 border-l border-border pl-5">
              {items.slice(0, 5).map((t) => (
                <li key={t.id} className="relative">
                  <span className="absolute -left-[26px] flex h-4 w-4 items-center justify-center rounded-full bg-gradient-brand text-primary-foreground">
                    <t.icon className="h-2.5 w-2.5" />
                  </span>
                  <p className="text-xs text-muted-foreground">{t.time}</p>
                  <p className="text-sm font-medium">{t.title}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
