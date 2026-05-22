import { clerkClient } from "@clerk/nextjs/server";

const DEFAULT_CLERK_ADMIN_EMAILS = ["nhatanhvo741@gmail.com"];

export function getClerkAdminEmails() {
  const raw = process.env.CLERK_ADMIN_EMAILS;
  const fromEnv = raw
    ? raw
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
    : [];

  const merged = fromEnv.length ? fromEnv : DEFAULT_CLERK_ADMIN_EMAILS;
  return new Set(merged);
}

export function isClerkAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getClerkAdminEmails().has(email.toLowerCase());
}

export async function getClerkPrimaryEmail(userId: string): Promise<string | null> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  const primary =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    null;

  return primary?.toLowerCase() ?? null;
}

export async function isClerkAdminUser(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false;

  const adminEmails = getClerkAdminEmails();
  try {
    const email = await getClerkPrimaryEmail(userId);
    if (!email) return false;
    return adminEmails.has(email);
  } catch {
    return false;
  }
}

export async function deleteClerkUsersByEmail(email: string): Promise<number> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return 0;

  const client = await clerkClient();
  const result = await client.users.getUserList({ emailAddress: [normalizedEmail], limit: 100 });
  const users = Array.isArray(result?.data) ? result.data : [];

  for (const user of users) {
    await client.users.deleteUser(user.id);
  }

  return users.length;
}
