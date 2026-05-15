import { UserVipToggle } from "@/components/admin/user-vip-toggle";
import { AdminNav } from "@/components/admin/admin-nav";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await db.user.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <section className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950">
      <div className="mx-auto max-w-7xl">
        <AdminNav />
        <h1 className="my-8 text-4xl font-black">Nguoi dung</h1>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <Table>
            <TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Ten</TableHead><TableHead>Role</TableHead><TableHead>VIP</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.isVip ? "VIP" : "Free"}</TableCell>
                  <TableCell><UserVipToggle userId={user.id} isVip={user.isVip} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
