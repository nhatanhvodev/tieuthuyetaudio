import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function EmptyState({
  icon,
  title,
  description,
  action
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="text-center">
      <CardHeader>
        {icon ? (
          <div className="mx-auto mb-3 text-muted-foreground">{icon}</div>
        ) : null}
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-24 items-center justify-center rounded-md bg-secondary/60">
          {action ?? (
            <p className="text-sm text-muted-foreground">
              Không có dữ liệu để hiển thị
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
