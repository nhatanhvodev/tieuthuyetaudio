import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "border border-[color-mix(in_oklch,var(--foreground)_15%,transparent)] text-foreground",
        accent: "bg-accent text-accent-foreground",
        muted: "bg-muted text-muted-foreground",
        tertiary: "bg-[color-mix(in_srgb,var(--color-warning)_30%,transparent)] text-[var(--color-warning-content,#1f1300)]",
        info: "bg-info text-info-content",
        success: "bg-success text-success-content",
        warning: "bg-warning text-warning-content",
        error: "bg-destructive text-destructive-foreground",
        ghost: "bg-muted text-muted-foreground",
      },
      size: {
        xs: "px-1.5 py-0 text-[10px]",
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-sm",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

function Badge({ className, variant, size, ...props }: React.ComponentProps<"div"> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
