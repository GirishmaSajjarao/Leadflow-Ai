import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLeads } from "@/context/LeadsContext";
import { DISPATCH_STATUSES, type Dispatch, type DispatchStatus } from "@/types";

interface FormValues {
  orderId: string;
  client: string;
  productType: string;
  status: DispatchStatus;
  deliveryDate: string;
  vehicle: string;
  manager: string;
  notes: string;
  items: number;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  dispatch?: Dispatch | null;
}

export function DispatchDialog({ open, onOpenChange, dispatch }: Props) {
  const { addDispatch, updateDispatch, employees } = useLeads();
  const isEdit = !!dispatch;
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<FormValues>({
      defaultValues: {
        orderId: "", client: "", productType: "", status: "Pending",
        deliveryDate: "", vehicle: "", manager: "", notes: "", items: 1,
      },
    });

  useEffect(() => {
    if (open) {
      reset(dispatch ?? {
        orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        client: "", productType: "", status: "Pending",
        deliveryDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
        vehicle: "", manager: employees[0]?.name ?? "", notes: "", items: 1,
      });
    }
  }, [open, dispatch, employees, reset]);

  const status = watch("status");
  const manager = watch("manager");

  const onSubmit = (values: FormValues) => {
    if (isEdit && dispatch) {
      updateDispatch(dispatch.id, values);
      toast.success("Dispatch updated");
    } else {
      addDispatch(values);
      toast.success("Dispatch created");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Dispatch" : "New Dispatch"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update shipment details." : "Create a new shipment record."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Order ID</Label>
            <Input {...register("orderId", { required: true })} />
            {errors.orderId && <p className="text-xs text-destructive">Required</p>}
          </div>
          <div className="space-y-2">
            <Label>Client Name</Label>
            <Input {...register("client", { required: true })} />
            {errors.client && <p className="text-xs text-destructive">Required</p>}
          </div>
          <div className="space-y-2">
            <Label>Product Type</Label>
            <Input {...register("productType", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label>Items</Label>
            <Input type="number" min={1} {...register("items", { required: true, valueAsNumber: true, min: 1 })} />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setValue("status", v as DispatchStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DISPATCH_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Delivery Date</Label>
            <Input type="date" {...register("deliveryDate", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label>Assigned Vehicle</Label>
            <Input placeholder="MH-12-AB-1234" {...register("vehicle", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label>Assigned Manager</Label>
            <Select value={manager} onValueChange={(v) => setValue("manager", v)}>
              <SelectTrigger><SelectValue placeholder="Select manager" /></SelectTrigger>
              <SelectContent>
                {employees.map((e) => <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Shipment Notes</Label>
            <Textarea rows={3} {...register("notes")} />
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-gradient-brand text-primary-foreground">
              {isEdit ? "Save Changes" : "Create Dispatch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
