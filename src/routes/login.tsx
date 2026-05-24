import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

interface FormValues {
  email: string;
  password: string;
}

function LoginPage() {
  const { user, login, isLoaded } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: { email: "admin@leadflow.ai", password: "admin123" },
  });

  if (isLoaded && user) return <Navigate to="/dashboard" />;

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      toast.success("Welcome back!");
      navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-brand opacity-10" />
      <div className="relative grid min-h-screen lg:grid-cols-2">
        <div className="hidden flex-col justify-between p-12 lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-lg">
              <Sparkles className="h-6 w-6" />
            </div>
            <span className="text-lg font-semibold tracking-tight">LeadFlow AI</span>
          </div>
          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight tracking-tight">
              The smart CRM your{" "}
              <span className="text-gradient-brand">manufacturing team</span> deserves.
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              Capture leads, run pipelines, hand off to dispatch, and track team performance —
              all in one beautifully-designed workspace.
            </p>
            <div className="grid max-w-lg grid-cols-3 gap-3">
              {["Leads", "Kanban", "Dispatch"].map((t) => (
                <div key={t} className="glass rounded-2xl p-4 text-sm font-medium">
                  {t}
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">© LeadFlow AI · Manufacturing CRM Suite</p>
        </div>

        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="glass w-full max-w-md rounded-3xl p-8">
            <div className="mb-6 flex items-center gap-2 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="font-semibold">LeadFlow AI</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Sign in</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome back. Enter your details to continue.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email", { required: "Email is required" })}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register("password", { required: "Password is required" })}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90"
                disabled={submitting}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign in
              </Button>
            </form>

            <div className="mt-4 rounded-xl border border-dashed bg-muted/40 p-3 text-xs">
              <p className="font-semibold">Demo accounts</p>
              <div className="mt-1 grid gap-1 text-muted-foreground">
                <button
                  type="button"
                  className="text-left hover:text-foreground"
                  onClick={() => {
                    setValue("email", "admin@leadflow.ai");
                    setValue("password", "admin123");
                  }}
                >
                  admin@leadflow.ai · admin123 (Admin)
                </button>
                <button
                  type="button"
                  className="text-left hover:text-foreground"
                  onClick={() => {
                    setValue("email", "priya@leadflow.ai");
                    setValue("password", "demo1234");
                  }}
                >
                  priya@leadflow.ai · demo1234 (Employee)
                </button>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-primary hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
