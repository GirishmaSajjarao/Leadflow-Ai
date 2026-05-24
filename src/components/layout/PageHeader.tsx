import { ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: { label: string; to?: string }[];
  actions?: ReactNode;
}

export function PageHeader({ title, description, breadcrumb, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-500 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Link to="/dashboard" className="hover:text-foreground">Home</Link>
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3" />
                {b.to ? (
                  <Link to={b.to} className="hover:text-foreground">{b.label}</Link>
                ) : (
                  <span className="text-foreground">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          <span className="text-gradient-brand">{title}</span>
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
