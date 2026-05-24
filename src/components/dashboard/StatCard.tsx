import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  icon: ReactNode;
  trend?: "up" | "down" | "flat";
  accent?: "indigo" | "cyan" | "green" | "amber" | "red";
}

const ACCENTS: Record<string, string> = {
  indigo: "from-[oklch(0.55_0.2_277)] to-[oklch(0.7_0.16_260)]",
  cyan: "from-[oklch(0.7_0.14_200)] to-[oklch(0.78_0.12_220)]",
  green: "from-[oklch(0.65_0.16_155)] to-[oklch(0.72_0.14_175)]",
  amber: "from-[oklch(0.78_0.16_75)] to-[oklch(0.82_0.14_55)]",
  red: "from-[oklch(0.62_0.22_27)] to-[oklch(0.68_0.2_15)]",
};

export function StatCard({ label, value, delta, icon, trend = "flat", accent = "indigo" }: StatCardProps) {
  return (
    <div className="glass group relative overflow-hidden rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className={cn("absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition-opacity group-hover:opacity-30", ACCENTS[accent])} />
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm", ACCENTS[accent])}>
          {icon}
        </div>
      </div>
      <div className="mt-3 text-3xl font-bold tracking-tight">{value}</div>
      {delta && (
        <p
          className={cn(
            "mt-1 text-xs font-medium",
            trend === "up" && "text-success",
            trend === "down" && "text-destructive",
            trend === "flat" && "text-muted-foreground",
          )}
        >
          {delta}
        </p>
      )}
    </div>
  );
}
