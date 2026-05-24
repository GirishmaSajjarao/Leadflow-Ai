import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Dispatch, Employee, Lead, LeadStatus } from "@/types";
import { SEED_DISPATCHES, SEED_EMPLOYEES, SEED_LEADS } from "@/lib/mock-data";

interface LeadsState {
  leads: Lead[];
  employees: Employee[];
  dispatches: Dispatch[];
  addLead: (lead: Omit<Lead, "id" | "createdAt">) => Lead;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  setStatus: (id: string, status: LeadStatus) => void;
  addEmployee: (e: Omit<Employee, "id">) => Employee;
  updateEmployee: (id: string, patch: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addDispatch: (d: Omit<Dispatch, "id" | "createdAt" | "timeline">) => Dispatch;
  updateDispatch: (id: string, patch: Partial<Dispatch>) => void;
  deleteDispatch: (id: string) => void;
}

const LeadsContext = createContext<LeadsState | null>(null);
const LEADS_KEY = "leadflow.leads";
const EMP_KEY = "leadflow.employees";
const DISP_KEY = "leadflow.dispatches";

function load<T>(key: string, seed: T): T {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
}

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);

  useEffect(() => {
    setLeads(load(LEADS_KEY, SEED_LEADS));
    setEmployees(load(EMP_KEY, SEED_EMPLOYEES));
    setDispatches(load(DISP_KEY, SEED_DISPATCHES));
  }, []);

  const persistLeads = (n: Lead[]) => { setLeads(n); localStorage.setItem(LEADS_KEY, JSON.stringify(n)); };
  const persistEmp = (n: Employee[]) => { setEmployees(n); localStorage.setItem(EMP_KEY, JSON.stringify(n)); };
  const persistDisp = (n: Dispatch[]) => { setDispatches(n); localStorage.setItem(DISP_KEY, JSON.stringify(n)); };

  const value: LeadsState = {
    leads, employees, dispatches,
    addLead: (lead) => {
      const n: Lead = { ...lead, id: `lead-${Date.now()}`, createdAt: new Date().toISOString() };
      persistLeads([n, ...leads]);
      return n;
    },
    updateLead: (id, patch) => persistLeads(leads.map((l) => (l.id === id ? { ...l, ...patch } : l))),
    deleteLead: (id) => persistLeads(leads.filter((l) => l.id !== id)),
    setStatus: (id, status) => persistLeads(leads.map((l) => (l.id === id ? { ...l, status } : l))),
    addEmployee: (e) => {
      const n: Employee = { ...e, id: `emp-${Date.now()}` };
      persistEmp([n, ...employees]);
      return n;
    },
    updateEmployee: (id, patch) => persistEmp(employees.map((e) => (e.id === id ? { ...e, ...patch } : e))),
    deleteEmployee: (id) => persistEmp(employees.filter((e) => e.id !== id)),
    addDispatch: (d) => {
      const n: Dispatch = {
        ...d,
        id: `DSP-${Date.now().toString().slice(-5)}`,
        createdAt: new Date().toISOString(),
        timeline: [{ at: new Date().toISOString(), label: "Dispatch created" }],
      };
      persistDisp([n, ...dispatches]);
      return n;
    },
    updateDispatch: (id, patch) => {
      persistDisp(dispatches.map((d) => {
        if (d.id !== id) return d;
        const next = { ...d, ...patch };
        if (patch.status && patch.status !== d.status) {
          next.timeline = [...d.timeline, { at: new Date().toISOString(), label: `Status → ${patch.status}` }];
        }
        return next;
      }));
    },
    deleteDispatch: (id) => persistDisp(dispatches.filter((d) => d.id !== id)),
  };

  return <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>;
}

export function useLeads() {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error("useLeads must be used within LeadsProvider");
  return ctx;
}
