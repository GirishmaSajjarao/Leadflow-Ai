import type { DispatchStatus } from "@/types";

export function progressForStatus(s: DispatchStatus) {
  switch (s) {
    case "Pending": return 10;
    case "Processing": return 30;
    case "Packed": return 50;
    case "In Transit": return 75;
    case "Delivered": return 100;
    case "Delayed": return 60;
  }
}

export function statusVariant(s: DispatchStatus) {
  switch (s) {
    case "Delivered": return "bg-success/15 text-success border-success/30";
    case "In Transit": return "bg-primary/15 text-primary border-primary/30";
    case "Delayed": return "bg-destructive/15 text-destructive border-destructive/30";
    case "Packed": return "bg-accent/15 text-accent-foreground border-accent/30";
    case "Processing": return "bg-warning/15 text-warning border-warning/30";
    default: return "bg-secondary text-foreground border-border";
  }
}
