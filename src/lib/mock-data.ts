import type { Employee, Lead } from "@/types";

export const SEED_EMPLOYEES: Employee[] = [
  { id: "u1", name: "Aarav Mehta", email: "aarav@leadflow.ai", role: "admin", department: "Operations", phone: "+91 98200 11221", status: "Active", target: 1500000, joinedAt: "2023-04-12" },
  { id: "u2", name: "Priya Sharma", email: "priya@leadflow.ai", role: "employee", department: "Sales", phone: "+91 98201 88112", status: "Active", target: 900000, joinedAt: "2023-08-05" },
  { id: "u3", name: "Rohan Kapoor", email: "rohan@leadflow.ai", role: "employee", department: "Logistics", phone: "+91 98202 33145", status: "Active", target: 850000, joinedAt: "2024-01-22" },
  { id: "u4", name: "Neha Iyer", email: "neha@leadflow.ai", role: "employee", department: "Sales", phone: "+91 98203 55421", status: "On Leave", target: 800000, joinedAt: "2024-03-10" },
  { id: "u5", name: "Vikram Singh", email: "vikram@leadflow.ai", role: "employee", department: "Manufacturing", phone: "+91 98204 71234", status: "Active", target: 750000, joinedAt: "2024-06-18" },
];

const industries = ["Automotive", "Electronics", "Textiles", "Pharma", "FMCG", "Steel", "Plastics"];
const sources = ["Website", "Referral", "Cold Call", "LinkedIn", "Trade Show", "Email Campaign"];
const companies = [
  "Apex Industries", "Bluewave Components", "Crestline Mfg", "Delta Forge",
  "Evergreen Polymers", "Falcon Steelworks", "Greenline Pharma", "Helios Auto",
  "Indus Textiles", "Janta Plastics", "Kavya Electronics", "Lumen FMCG",
];
const names = [
  "Rahul Verma", "Sneha Patel", "Arjun Nair", "Kavya Rao", "Manish Gupta",
  "Tanya Bhat", "Sahil Khan", "Pooja Reddy", "Devansh Joshi", "Anita Desai",
  "Karan Malhotra", "Rhea Pillai",
];
const statuses: Lead["status"][] = [
  "New", "New", "Contacted", "Contacted", "Qualified",
  "Proposal Sent", "Proposal Sent", "Negotiation", "Won", "Won", "Lost", "Contacted",
];
const priorities: Lead["priority"][] = ["High", "Medium", "Low"];

function rand<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

export const SEED_LEADS: Lead[] = companies.map((company, i) => {
  const created = new Date();
  created.setDate(created.getDate() - (i * 4 + 2));
  const followUp = new Date();
  followUp.setDate(followUp.getDate() + ((i % 7) + 1));
  return {
    id: `lead-${i + 1}`,
    companyName: company,
    clientName: rand(names, i),
    phone: `+91 9${(800000000 + i * 12345).toString().slice(0, 9)}`,
    email: `${company.toLowerCase().replace(/[^a-z]/g, "")}@corp.com`,
    industry: rand(industries, i),
    source: rand(sources, i + 1),
    status: statuses[i],
    priority: rand(priorities, i),
    assignedTo: SEED_EMPLOYEES[(i % 4) + 1].id,
    expectedRevenue: 50000 + ((i * 37) % 20) * 12500,
    notes: "Initial discovery call completed. Awaiting technical specs from client.",
    followUpDate: followUp.toISOString(),
    createdAt: created.toISOString(),
  };
});

import type { Dispatch } from "@/types";

export const SEED_DISPATCHES: Dispatch[] = [
  {
    id: "DSP-1042", orderId: "ORD-2042", client: "Apex Industries", productType: "Industrial Bearings",
    status: "In Transit", deliveryDate: new Date(Date.now() + 2*86400000).toISOString().slice(0,10),
    vehicle: "MH-12-AB-4521", manager: "Aarav Mehta", notes: "Express route via Pune hub.", items: 24,
    createdAt: new Date(Date.now() - 3*86400000).toISOString(),
    timeline: [
      { at: new Date(Date.now() - 3*86400000).toISOString(), label: "Dispatch created" },
      { at: new Date(Date.now() - 2*86400000).toISOString(), label: "Status → Packed" },
      { at: new Date(Date.now() - 86400000).toISOString(), label: "Status → In Transit" },
    ],
  },
  {
    id: "DSP-1041", orderId: "ORD-2041", client: "Bluewave Components", productType: "Steel Brackets",
    status: "Packed", deliveryDate: new Date(Date.now() + 5*86400000).toISOString().slice(0,10),
    vehicle: "MH-14-CD-1187", manager: "Priya Sharma", notes: "Awaiting carrier pickup.", items: 12,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    timeline: [
      { at: new Date(Date.now() - 86400000).toISOString(), label: "Dispatch created" },
      { at: new Date().toISOString(), label: "Status → Packed" },
    ],
  },
  {
    id: "DSP-1040", orderId: "ORD-2040", client: "Crestline Mfg", productType: "Aluminium Casings",
    status: "Delivered", deliveryDate: new Date(Date.now() - 86400000).toISOString().slice(0,10),
    vehicle: "GJ-01-EF-2245", manager: "Rohan Kapoor", notes: "Signed by R. Mehta.", items: 50,
    createdAt: new Date(Date.now() - 7*86400000).toISOString(),
    timeline: [
      { at: new Date(Date.now() - 7*86400000).toISOString(), label: "Dispatch created" },
      { at: new Date(Date.now() - 86400000).toISOString(), label: "Status → Delivered" },
    ],
  },
  {
    id: "DSP-1039", orderId: "ORD-2039", client: "Delta Forge", productType: "Forged Components",
    status: "Delayed", deliveryDate: new Date(Date.now() + 86400000).toISOString().slice(0,10),
    vehicle: "MH-12-GH-9981", manager: "Neha Iyer", notes: "Weather diversion via Nashik.", items: 8,
    createdAt: new Date(Date.now() - 4*86400000).toISOString(),
    timeline: [
      { at: new Date(Date.now() - 4*86400000).toISOString(), label: "Dispatch created" },
      { at: new Date(Date.now() - 2*86400000).toISOString(), label: "Status → Delayed" },
    ],
  },
];
