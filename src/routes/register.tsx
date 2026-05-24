import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

interface FormValues {
  name: string;
  email: string;
  password: string;
  role: Role;
}

function RegisterPage() {
  const { user, register: registerUser, isLoaded } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [role, setRole] = useState<Role>("employee");
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  if (isLoaded && user) return <Navigate to="/dashboard" />;

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      await registerUser(data.name, data.email, data.password, role);
      toast.success("Account created");
      navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-6">
      <div className="pointer-events-none absolute inset-0 bg-gradient-brand opacity-10" />
      <div className="glass relative w-full max-w-md rounded-3xl p-8">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-semibold">LeadFlow AI</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Start managing your pipeline in minutes.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" {...register("name", { required: "Name is required" })} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90"
            disabled={submitting}
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
