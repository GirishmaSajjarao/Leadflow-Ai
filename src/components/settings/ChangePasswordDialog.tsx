import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

interface FormValues {
  current: string;
  next: string;
  confirm: string;
}

function scorePassword(p: string) {
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  if (p.length >= 12) score++;
  return Math.min(score, 4);
}

const STRENGTH = ["Too short", "Weak", "Fair", "Good", "Strong"];
const COLORS = ["bg-destructive", "bg-destructive", "bg-warning", "bg-primary", "bg-success"];

export function ChangePasswordDialog({ open, onOpenChange }: Props) {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>();
  const [show, setShow] = useState({ c: false, n: false, x: false });
  const [logoutAll, setLogoutAll] = useState(false);
  const [busy, setBusy] = useState(false);

  const next = watch("next") ?? "";
  const score = scorePassword(next);
  const pct = (score / 4) * 100;

  const onSubmit = async (v: FormValues) => {
    // mock check: any non-empty current value succeeds except "wrong"
    if (v.current === "wrong") {
      toast.error("Current password is incorrect");
      return;
    }
    if (v.next !== v.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (score < 3) {
      toast.error("Choose a stronger password");
      return;
    }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    setBusy(false);
    toast.success("Password updated", { description: logoutAll ? "Signed out from all devices." : undefined });
    reset();
    onOpenChange(false);
  };

  const reqs = [
    { ok: next.length >= 8, label: "At least 8 characters" },
    { ok: /[A-Z]/.test(next), label: "One uppercase letter" },
    { ok: /[0-9]/.test(next), label: "One number" },
    { ok: /[^A-Za-z0-9]/.test(next), label: "One special character" },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Change Password</DialogTitle>
          <DialogDescription>Keep your account secure with a strong password.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <PwField
            label="Current password"
            show={show.c}
            onToggle={() => setShow((s) => ({ ...s, c: !s.c }))}
            register={register("current", { required: true })}
            error={errors.current && "Required"}
          />
          <PwField
            label="New password"
            show={show.n}
            onToggle={() => setShow((s) => ({ ...s, n: !s.n }))}
            register={register("next", { required: true, minLength: 8 })}
            error={errors.next && "Min 8 chars"}
          />

          {next && (
            <div className="space-y-2">
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className={`h-full transition-all duration-300 ${COLORS[score]}`} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">Strength: <span className="font-medium text-foreground">{STRENGTH[score]}</span></p>
              <ul className="grid grid-cols-2 gap-1 text-xs">
                {reqs.map((r) => (
                  <li key={r.label} className={r.ok ? "text-success" : "text-muted-foreground"}>
                    {r.ok ? "✓" : "○"} {r.label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <PwField
            label="Confirm new password"
            show={show.x}
            onToggle={() => setShow((s) => ({ ...s, x: !s.x }))}
            register={register("confirm", { required: true, validate: (v) => v === next || "Passwords must match" })}
            error={errors.confirm?.message}
          />

          <div className="flex items-center justify-between rounded-lg border bg-card/40 p-3">
            <div>
              <p className="text-sm font-medium">Log out from all devices</p>
              <p className="text-xs text-muted-foreground">End every active session after change.</p>
            </div>
            <Switch checked={logoutAll} onCheckedChange={setLogoutAll} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
            <Button type="submit" className="bg-gradient-brand text-primary-foreground" disabled={busy}>
              {busy ? (<><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Updating…</>) : "Update password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PwField({ label, show, onToggle, register, error }: any) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <Input type={show ? "text" : "password"} {...register} />
        <button type="button" onClick={onToggle} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
