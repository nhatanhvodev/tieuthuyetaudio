import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function AdminBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
      <Link href="/admin" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
        <Home className="size-4" />
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1.5">
          <ChevronRight className="size-3.5 text-slate-300" />
          {item.href ? (
            <Link href={item.href} className="rounded-md px-1.5 py-0.5 font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700">
              {item.label}
            </Link>
          ) : (
            <span className="px-1.5 py-0.5 font-semibold text-slate-800">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
