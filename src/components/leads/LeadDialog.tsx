import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLeads } from "@/context/LeadsContext";
import { LEAD_STATUSES, type Lead, type LeadPriority, type LeadStatus } from "@/types";

interface FormValues {
  companyName: string;
  clientName: string;
  phone: string;
  email: string;
  industry: string;
  source: string;
  status: LeadStatus;
  priority: LeadPriority;
  assignedTo: string;
  expectedRevenue: number;
  notes: string;
  followUpDate: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lead?: Lead | null;
}

export function LeadDialog({ open, onOpenChange, lead }: Props) {
  const { addLead, updateLead, employees } = useLeads();
  const isEdit = !!lead;
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<FormValues>();

  useEffect(() => {
    if (open) {
      reset({
        companyName: lead?.companyName ?? "",
        clientName: lead?.clientName ?? "",
        phone: lead?.phone ?? "",
        email: lead?.email ?? "",
        industry: lead?.industry ?? "",
        source: lead?.source ?? "Website",
        status: lead?.status ?? "New",
        priority: lead?.priority ?? "Medium",
        assignedTo: lead?.assignedTo ?? employees[1]?.id ?? "",
        expectedRevenue: lead?.expectedRevenue ?? 0,
        notes: lead?.notes ?? "",
        followUpDate: lead?.followUpDate?.slice(0, 10) ?? "",
      });
    }
  }, [open, lead, employees, reset]);

  const status = watch("status");
  const priority = watch("priority");
  const assignedTo = watch("assignedTo");
  const source = watch("source");

  const onSubmit = (data: FormValues) => {
    const payload = {
      ...data,
      expectedRevenue: Number(data.expectedRevenue) || 0,
      followUpDate: data.followUpDate
        ? new Date(data.followUpDate).toISOString()
        : undefined,
    };
    if (isEdit && lead) {
      updateLead(lead.id, payload);
      toast.success("Lead updated");
    } else {
      addLead(payload);
      toast.success("Lead created");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit lead" : "Create new lead"}</DialogTitle>
          <DialogDescription>
            Capture client info and assign it to a team member.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Company name</Label>
            <Input {...register("companyName", { required: "Required" })} />
            {errors.companyName && (
              <p className="text-xs text-destructive">{errors.companyName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Client name</Label>
            <Input {...register("clientName", { required: "Required" })} />
            {errors.clientName && (
              <p className="text-xs text-destructive">{errors.clientName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input {...register("phone")} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" {...register("email")} />
          </div>
          <div className="space-y-1.5">
            <Label>Industry</Label>
            <Input {...register("industry")} placeholder="e.g. Automotive" />
          </div>
          <div className="space-y-1.5">
            <Label>Lead source</Label>
            <Select value={source} onValueChange={(v) => setValue("source", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Website", "Referral", "Cold Call", "LinkedIn", "Trade Show", "Email Campaign"].map(
                  (s) => <SelectItem key={s} value={s}>{s}</SelectItem>,
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setValue("status", v as LeadStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setValue("priority", v as LeadPriority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(["High", "Medium", "Low"] as LeadPriority[]).map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Assigned to</Label>
            <Select value={assignedTo} onValueChange={(v) => setValue("assignedTo", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Expected revenue (₹)</Label>
            <Input type="number" {...register("expectedRevenue", { valueAsNumber: true })} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Follow-up date</Label>
            <Input type="date" {...register("followUpDate")} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Notes</Label>
            <Textarea rows={3} {...register("notes")} />
          </div>
          <DialogFooter className="md:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-brand text-primary-foreground hover:opacity-90">
              {isEdit ? "Save changes" : "Create lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
