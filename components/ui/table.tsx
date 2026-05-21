import * as React from "react";
import { cn } from "@/lib/utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="w-full overflow-auto rounded-xl border border-[color-mix(in_oklch,var(--foreground)_8%,transparent)] bg-[color-mix(in_srgb,var(--background)_95%,transparent)]">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
}
function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead className={cn("[&_tr]:border-b border-[color-mix(in_oklch,var(--foreground)_8%,transparent)] bg-muted", className)} {...props} />
  );
}
function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody className={cn(className)} {...props} />;
}
function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr className={cn("border-b border-[color-mix(in_oklch,var(--foreground)_6%,transparent)] transition-colors hover:bg-[color-mix(in_srgb,var(--foreground)_4%,transparent)]", className)} {...props} />
  );
}
function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return <th className={cn("text-left align-middle font-semibold text-xs uppercase tracking-wider text-muted-foreground px-4 py-3", className)} {...props} />;
}
function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("align-middle px-4 py-3", className)} {...props} />;
}

export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow };
