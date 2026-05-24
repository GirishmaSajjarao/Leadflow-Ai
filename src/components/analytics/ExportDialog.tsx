import { useState } from "react";
import { FileText, FileSpreadsheet, FileType2, Loader2, Check } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type Format = "pdf" | "csv" | "xlsx";

export interface AnalyticsExportData {
  kpis: { label: string; value: string }[];
  revenue: { m: string; revenue: number; target: number }[];
  funnel: { stage: string; count: number }[];
  meta: { label: string; value: string }[];
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  data: AnalyticsExportData;
  onExported?: (info: { format: Format; filename: string; at: string }) => void;
}

export function ExportDialog({ open, onOpenChange, data, onExported }: Props) {
  const [format, setFormat] = useState<Format>("pdf");
  const [filename, setFilename] = useState(`leadflow-analytics-${new Date().toISOString().slice(0, 10)}`);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      const name = filename.trim() || "leadflow-analytics";
      if (format === "pdf") exportPDF(name, data, from, to);
      else if (format === "csv") exportCSV(name, data);
      else exportXLSX(name, data);
      const stamp = new Date().toISOString();
      toast.success(`Exported ${name}.${format}`);
      onExported?.({ format, filename: `${name}.${format}`, at: stamp });
      onOpenChange(false);
    } catch (e: any) {
      toast.error("Export failed", { description: e?.message });
    } finally {
      setBusy(false);
    }
  };

  const formats: { id: Format; label: string; desc: string; icon: any }[] = [
    { id: "pdf", label: "PDF Report", desc: "Branded printable summary", icon: FileType2 },
    { id: "csv", label: "CSV", desc: "Comma-separated values", icon: FileText },
    { id: "xlsx", label: "Excel", desc: "Multi-sheet workbook", icon: FileSpreadsheet },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Export Analytics Report</DialogTitle>
          <DialogDescription>Choose a format and download your report.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {formats.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFormat(f.id)}
                className={`group rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5 ${
                  format === f.id ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "border-border bg-card/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <f.icon className="h-5 w-5 text-primary" />
                  {format === f.id && <Check className="h-4 w-4 text-primary" />}
                </div>
                <p className="mt-2 text-sm font-medium">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Filename</Label>
            <Input value={filename} onChange={(e) => setFilename(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>From</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button className="bg-gradient-brand text-primary-foreground" onClick={handleExport} disabled={busy}>
            {busy ? (<><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Exporting…</>) : "Download"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function exportPDF(name: string, d: AnalyticsExportData, from: string, to: string) {
  const doc = new jsPDF();
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18); doc.text("LeadFlow AI", 14, 13);
  doc.setFontSize(10); doc.text("Analytics Report", 14, 21);
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 36);
  if (from || to) doc.text(`Range: ${from || "—"} → ${to || "—"}`, 14, 41);

  autoTable(doc, {
    startY: 48,
    head: [["KPI", "Value"]],
    body: d.kpis.map((k) => [k.label, k.value]),
    headStyles: { fillColor: [79, 70, 229] },
    theme: "striped",
  });
  autoTable(doc, {
    head: [["Month", "Revenue (₹k)", "Target (₹k)"]],
    body: d.revenue.map((r) => [r.m, r.revenue, r.target]),
    headStyles: { fillColor: [14, 165, 233] },
    theme: "striped",
  });
  autoTable(doc, {
    head: [["Funnel Stage", "Count"]],
    body: d.funnel.map((f) => [f.stage, f.count]),
    headStyles: { fillColor: [99, 102, 241] },
    theme: "striped",
  });
  if (d.meta.length) {
    autoTable(doc, {
      head: [["Insight", "Value"]],
      body: d.meta.map((m) => [m.label, m.value]),
      headStyles: { fillColor: [16, 185, 129] },
      theme: "striped",
    });
  }
  doc.save(`${name}.pdf`);
}

function exportCSV(name: string, d: AnalyticsExportData) {
  const lines: string[] = [];
  lines.push("LeadFlow AI — Analytics Report");
  lines.push(`Generated,${new Date().toISOString()}`);
  lines.push("");
  lines.push("KPI,Value");
  d.kpis.forEach((k) => lines.push(`${k.label},${k.value}`));
  lines.push("");
  lines.push("Month,Revenue (k),Target (k)");
  d.revenue.forEach((r) => lines.push(`${r.m},${r.revenue},${r.target}`));
  lines.push("");
  lines.push("Funnel Stage,Count");
  d.funnel.forEach((f) => lines.push(`${f.stage},${f.count}`));
  lines.push("");
  lines.push("Insight,Value");
  d.meta.forEach((m) => lines.push(`${m.label},${m.value}`));
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  saveAs(blob, `${name}.csv`);
}

function exportXLSX(name: string, d: AnalyticsExportData) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(d.kpis), "KPIs");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(d.revenue), "Revenue");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(d.funnel), "Funnel");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(d.meta), "Insights");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buf], { type: "application/octet-stream" }), `${name}.xlsx`);
}
