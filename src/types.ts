export type Role = "admin" | "employee";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

export type LeadStatus =
  | "New"
  | "Contacted"
  | "Qualified"
  | "Proposal Sent"
  | "Negotiation"
  | "Won"
  | "Lost";

export type LeadPriority = "Low" | "Medium" | "High";

export interface Lead {
  id: string;
  companyName: string;
  clientName: string;
  phone: string;
  email: string;
  industry: string;
  source: string;
  status: LeadStatus;
  priority: LeadPriority;
  assignedTo: string; // employee id
  expectedRevenue: number;
  notes: string;
  followUpDate?: string;
  createdAt: string;
}

export type EmployeeStatus = "Active" | "On Leave" | "Inactive";

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  department?: string;
  phone?: string;
  status?: EmployeeStatus;
  target?: number;
  joinedAt?: string;
}

export type DispatchStatus =
  | "Pending" | "Processing" | "Packed" | "In Transit" | "Delivered" | "Delayed";

export const DISPATCH_STATUSES: DispatchStatus[] = [
  "Pending", "Processing", "Packed", "In Transit", "Delivered", "Delayed",
];

export interface DispatchEvent { at: string; label: string }

export interface Dispatch {
  id: string;
  orderId: string;
  client: string;
  productType: string;
  status: DispatchStatus;
  deliveryDate: string;
  vehicle: string;
  manager: string;
  notes: string;
  items: number;
  createdAt: string;
  timeline: DispatchEvent[];
}

export const LEAD_STATUSES: LeadStatus[] = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
];

export const KANBAN_COLUMNS: { id: LeadStatus; title: string }[] = [
  { id: "New", title: "New" },
  { id: "Contacted", title: "Contacted" },
  { id: "Proposal Sent", title: "Proposal" },
  { id: "Negotiation", title: "Negotiation" },
  { id: "Won", title: "Won" },
];
