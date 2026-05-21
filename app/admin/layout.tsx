import { AdminNav } from "@/components/admin/admin-nav";
import { AdminThemeLock } from "@/components/admin/admin-theme-lock";
import { AdminToaster } from "@/components/admin/toaster";
import { AdminThemeToggle } from "@/components/admin/theme-toggle";
import { CommandPalette } from "@/components/admin/command-palette";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { requireAdmin } from "@/lib/auth";
import type { CSSProperties } from "react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <section className="admin-shell min-h-screen">
      <AdminThemeLock />
      <AdminToaster />
      <CommandPalette />
      <SidebarProvider
        defaultOpen
        style={
          {
            "--sidebar-width": "17.5rem",
            "--sidebar-width-icon": "4.25rem"
          } as CSSProperties
        }
      >
        <AdminNav />

        <SidebarInset>
          <main className="min-h-screen space-y-4 p-3 sm:p-4 lg:p-6">
            <section className="admin-panel flex flex-wrap items-start justify-between gap-3 rounded-2xl px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Bảng điều khiển</p>
                <h1 className="mt-1 text-xl font-black text-slate-900">Quản trị Tiểu thuyết Audio</h1>
                <p className="admin-subtle mt-1 text-sm">
                  Đăng nhập: {session.user.email}
                  <kbd className="ml-3 hidden rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 md:inline-flex items-center gap-0.5">
                    <span>⌘</span><span>K</span>
                  </kbd>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <AdminThemeToggle />
                <SidebarTrigger />
              </div>
            </section>
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </section>
  );
}
