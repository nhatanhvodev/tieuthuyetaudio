import * as React from "react";
import { cn } from "@/lib/utils";

function Avatar({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("relative flex size-10 shrink-0 overflow-hidden rounded-full bg-secondary", className)} {...props} />;
}
function AvatarFallback({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex size-full items-center justify-center rounded-full text-sm font-semibold", className)} {...props} />;
}

export { Avatar, AvatarFallback };
