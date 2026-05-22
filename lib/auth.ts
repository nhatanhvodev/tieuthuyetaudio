import { auth as clerkAuth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getClerkPrimaryEmail, isClerkAdminEmail, isClerkAdminUser } from "@/lib/clerk-admin";

type AppUser = {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  image: string | null;
  role: "USER" | "ADMIN";
  isVip: boolean;
};

export type AppSession = {
  user: AppUser;
  expires: string;
};

type ClerkIdentity = {
  clerkUserId: string;
  email: string;
  name: string | null;
  image: string | null;
};

async function resolveClerkIdentity(): Promise<ClerkIdentity | null> {
  const session = await clerkAuth();
  if (!session.userId) return null;

  const claims = session.sessionClaims as Record<string, unknown> | null;
  const emailFromClaims =
    (typeof claims?.email === "string" && claims.email) ||
    (typeof claims?.email_address === "string" && claims.email_address) ||
    null;
  const nameFromClaims =
    (typeof claims?.name === "string" && claims.name) ||
    (typeof claims?.full_name === "string" && claims.full_name) ||
    null;
  const imageFromClaims = (typeof claims?.image_url === "string" && claims.image_url) || null;

  let email = emailFromClaims?.toLowerCase() ?? null;
  let name = nameFromClaims;
  let image = imageFromClaims;

  if (!email || !name || !image) {
    const client = await clerkClient();
    const user = await client.users.getUser(session.userId);
    email =
      email ??
      user.primaryEmailAddress?.emailAddress?.toLowerCase() ??
      user.emailAddresses[0]?.emailAddress?.toLowerCase() ??
      (await getClerkPrimaryEmail(session.userId));
    name =
      (name ??
        [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ??
        user.username) || null;
    image = image ?? user.imageUrl ?? null;
  }

  if (!email) return null;

  return {
    clerkUserId: session.userId,
    email,
    name: name || null,
    image
  };
}

async function ensureDbUserFromClerk(identity: ClerkIdentity): Promise<AppUser> {
  const existing = await db.user.findUnique({
    where: { email: identity.email },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      isVip: true
    }
  });

  if (existing) {
    return {
      id: existing.id,
      clerkId: identity.clerkUserId,
      email: existing.email,
      name: existing.name,
      image: existing.image,
      role: existing.role,
      isVip: existing.isVip
    };
  }

  const created = await db.user.create({
    data: {
      email: identity.email,
      name: identity.name,
      image: identity.image
    },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      isVip: true
    }
  });

  return {
    id: created.id,
    clerkId: identity.clerkUserId,
    email: created.email,
    name: created.name,
    image: created.image,
    role: created.role,
    isVip: created.isVip
  };
}

async function resolveSessionWithIdentity(): Promise<{ session: AppSession | null; identity: ClerkIdentity | null }> {
  const identity = await resolveClerkIdentity();
  if (!identity) return { session: null, identity: null };

  const user = await ensureDbUserFromClerk(identity);
  return {
    identity,
    session: {
      user,
      expires: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    }
  };
}

async function canAccessAdmin(identity: ClerkIdentity, session: AppSession): Promise<boolean> {
  if (session.user.role === "ADMIN") return true;
  if (isClerkAdminEmail(identity.email)) return true;
  return isClerkAdminUser(identity.clerkUserId);
}

export async function safeAuth(): Promise<AppSession | null> {
  try {
    const { session } = await resolveSessionWithIdentity();
    return session;
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<AppSession> {
  const session = await safeAuth();
  if (!session?.user) redirect("/dang-nhap");
  return session;
}

export async function requireAdmin(): Promise<AppSession> {
  const { session, identity } = await resolveSessionWithIdentity();
  if (!session || !identity) redirect("/dang-nhap");
  if (await canAccessAdmin(identity, session)) return session;
  redirect("/");
}

export type AdminApiAuthResult =
  | { ok: true; session: AppSession }
  | { ok: false; status: 401 | 403; error: string };

export async function requireAdminApi(): Promise<AdminApiAuthResult> {
  const { session, identity } = await resolveSessionWithIdentity();
  if (!session || !identity) {
    return { ok: false, status: 401, error: "Vui long dang nhap de tiep tuc." };
  }
  if (await canAccessAdmin(identity, session)) {
    return { ok: true, session };
  }
  return { ok: false, status: 403, error: "Ban khong co quyen truy cap admin." };
}
