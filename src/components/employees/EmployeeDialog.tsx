import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLeads } from "@/context/LeadsContext";
import type { Employee, EmployeeStatus, Role } from "@/types";

interface FormValues {
  name: string;
  email: string;
  role: Role;
  department: string;
  phone: string;
  status: EmployeeStatus;
  target: number;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  employee?: Employee | null;
}

const DEPTS = ["Sales", "Operations", "Logistics", "Manufacturing", "Finance", "HR"];

export function EmployeeDialog({ open, onOpenChange, employee }: Props) {
  const { addEmployee, updateEmployee } = useLeads();
  const isEdit = !!employee;
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<FormValues>({
      defaultValues: {
        name: "", email: "", role: "employee", department: "Sales",
        phone: "", status: "Active", target: 500000,
      },
    });

  useEffect(() => {
    if (open) {
      reset({
        name: employee?.name ?? "",
        email: employee?.email ?? "",
        role: employee?.role ?? "employee",
        department: employee?.department ?? "Sales",
        phone: employee?.phone ?? "",
        status: employee?.status ?? "Active",
        target: employee?.target ?? 500000,
      });
    }
  }, [open, employee, reset]);

  const role = watch("role");
  const department = watch("department");
  const status = watch("status");

  const onSubmit = (v: FormValues) => {
    if (isEdit && employee) {
      updateEmployee(employee.id, v);
      toast.success("Employee updated");
    } else {
      addEmployee({ ...v, joinedAt: new Date().toISOString().slice(0, 10) });
      toast.success("Employee invited");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Employee" : "Invite Member"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update team member details." : "Add a new team member."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Full Name</Label>
            <Input {...register("name", { required: true, minLength: 2 })} />
            {errors.name && <p className="text-xs text-destructive">Name required</p>}
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" {...register("email", { required: true, pattern: /^\S+@\S+$/ })} />
            {errors.email && <p className="text-xs text-destructive">Valid email required</p>}
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input {...register("phone")} placeholder="+91 98xxx xxxxx" />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setValue("role", v as Role)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Department</Label>
            <Select value={department} onValueChange={(v) => setValue("department", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DEPTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setValue("status", v as EmployeeStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="On Leave">On Leave</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Revenue Target (₹)</Label>
            <Input type="number" min={0} step={50000} {...register("target", { valueAsNumber: true })} />
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-gradient-brand text-primary-foreground">
              {isEdit ? "Save Changes" : "Invite Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
