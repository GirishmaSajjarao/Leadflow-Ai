import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { User as UserIcon, Moon, Sun, Bell, Shield, LogOut, Save, KeyRound, Clock, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { ChangePasswordDialog } from "@/components/settings/ChangePasswordDialog";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, updateProfile, logout } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [dark, setDark] = useState(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );
  const [notif, setNotif] = useState({ email: true, push: true, weekly: false });
  const [pwOpen, setPwOpen] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const lastLogin = new Date(Date.now() - 3600 * 1000 * 4).toLocaleString();
  const createdAt = "2024-02-14";


  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader
        title="Settings"
        description="Manage your profile, appearance and account preferences."
        breadcrumb={[{ label: "Settings" }]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="glass lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserIcon className="h-4 w-4" /> Profile
            </CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="capitalize">Role: {user?.role}</Badge>
              <Button
                className="bg-gradient-brand text-primary-foreground"
                onClick={() => {
                  updateProfile({ name, email });
                  toast.success("Profile updated");
                }}
              >
                <Save className="mr-1 h-4 w-4" /> Save changes
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} Appearance
            </CardTitle>
            <CardDescription>Theme preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Dark mode</p>
                <p className="text-xs text-muted-foreground">Switch the interface theme.</p>
              </div>
              <Switch checked={dark} onCheckedChange={setDark} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4" /> Notifications
            </CardTitle>
            <CardDescription>Choose what you want to be notified about.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { k: "email" as const, t: "Email alerts", d: "Receive deal updates via email." },
              { k: "push" as const, t: "Push notifications", d: "Browser notifications for activity." },
              { k: "weekly" as const, t: "Weekly digest", d: "Summary of pipeline performance." },
            ].map((n) => (
              <div key={n.k} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{n.t}</p>
                  <p className="text-xs text-muted-foreground">{n.d}</p>
                </div>
                <Switch checked={notif[n.k]} onCheckedChange={(v) => setNotif({ ...notif, [n.k]: v })} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4" /> Account
            </CardTitle>
            <CardDescription>Session and security.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-2 rounded-lg border bg-card/40 p-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3.5 w-3.5" /> Last login</span>
                <span className="font-medium">{lastLogin}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">{createdAt}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Session</span>
                <Badge variant="outline" className="gap-1 border-success/30 text-success">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setPwOpen(true)}>
              <KeyRound className="mr-1 h-4 w-4" /> Change password
            </Button>
            <Separator />
            <Button variant="destructive" className="w-full" onClick={logout}>
              <LogOut className="mr-1 h-4 w-4" /> Sign out
            </Button>
          </CardContent>
        </Card>
      </div>

      <ChangePasswordDialog open={pwOpen} onOpenChange={setPwOpen} />
    </div>
  );
}

