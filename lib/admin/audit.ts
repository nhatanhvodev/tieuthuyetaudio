import { db } from "@/lib/db";

type AuditInput = {
  actorId?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  payload?: unknown;
};

export async function createAdminAuditLog(input: AuditInput) {
  try {
    await db.adminAuditLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId ?? null,
        payload: input.payload as never
      }
    });
  } catch {
    // Best-effort logging. Never block admin operations when audit logging fails.
  }
}
