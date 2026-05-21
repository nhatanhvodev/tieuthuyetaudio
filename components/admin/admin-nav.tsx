"use client";

import Link from "next/link";
import { ArrowUpRight, BarChart3, BookOpen, FileClock, FolderTree, LayoutGrid, Library, Sparkles, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";

const links = [
  { href: "/admin", label: "Tổng quan", icon: LayoutGrid },
  { href: "/admin/truyen", label: "Truyện", icon: BookOpen },
  { href: "/admin/tap", label: "Tập", icon: Library },
  { href: "/admin/the-loai", label: "Thể loại", icon: FolderTree },
  { href: "/admin/nguoi-dung", label: "Người dùng", icon: Users },
  { href: "/admin/analytics", label: "Phân tích", icon: BarChart3 },
  { href: "/admin/audit", label: "Nhật ký hệ thống", icon: FileClock }
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-md">
            <Sparkles className="size-4" />
          </span>
          <div className="group-data-[collapsed=true]/sidebar:hidden">
            <p className="text-sm font-black text-slate-900">Tiểu thuyết Audio</p>
            <p className="text-xs text-slate-500">Trang quản trị</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Chức năng</SidebarGroupLabel>
          <SidebarMenu>
            {links.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
              return (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton asChild isActive={active} title={link.label}>
                    <Link href={link.href}>
                      <Icon className="size-4 shrink-0" />
                      <span className="group-data-[collapsed=true]/sidebar:hidden">{link.label}</span>
                      {active ? (
                        <span className="ml-auto size-1.5 rounded-full bg-indigo-600 group-data-[collapsed=true]/sidebar:hidden" />
                      ) : null}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild title="Về trang người dùng">
              <Link href="/">
                <ArrowUpRight className="size-4 shrink-0" />
                <span className="group-data-[collapsed=true]/sidebar:hidden">Về trang người dùng</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
