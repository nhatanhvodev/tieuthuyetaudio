"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Search, LayoutDashboard, BookOpen, Headphones, Tags, Users, BarChart3, ScrollText, Plus } from "lucide-react";

type CommandItem = {
  label: string;
  href: string;
  icon: React.ComponentType<React.ComponentProps<"svg">>;
  shortcut?: string;
};

const items: CommandItem[] = [
  { label: "Tổng quan", href: "/admin", icon: LayoutDashboard },
  { label: "Thêm truyện mới", href: "/admin/truyen/new", icon: Plus },
  { label: "Quản lý truyện", href: "/admin/truyen", icon: BookOpen },
  { label: "Quản lý tập", href: "/admin/tap", icon: Headphones },
  { label: "Quản lý thể loại", href: "/admin/the-loai", icon: Tags },
  { label: "Quản lý người dùng", href: "/admin/nguoi-dung", icon: Users },
  { label: "Phân tích", href: "/admin/analytics", icon: BarChart3 },
  { label: "Nhật ký hệ thống", href: "/admin/audit", icon: ScrollText }
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = query
    ? items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
    : items;

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router]
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  function onKeyDownNav(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === "Enter" && filtered[selectedIndex]) {
      event.preventDefault();
      navigate(filtered[selectedIndex].href);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 rounded-2xl border border-slate-200 bg-white shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-top-[10%] data-[state=open]:slide-in-from-top-[10%]">
          <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
            <Search className="size-4 text-slate-400" />
            <input
              className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="Tìm trang hoặc chức năng..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onKeyDownNav}
              autoFocus
            />
            <kbd className="inline-flex h-5 items-center gap-0.5 rounded-md border border-slate-200 bg-slate-100 px-1.5 text-[10px] font-semibold text-slate-500">
              <span>⌘</span><span>K</span>
            </kbd>
          </div>
          <div className="max-h-64 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-slate-500">Không tìm thấy kết quả.</p>
            ) : (
              filtered.map((item, index) => (
                <button
                  key={item.href}
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    index === selectedIndex
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                  onClick={() => navigate(item.href)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <item.icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              ))
            )}
          </div>
          <div className="border-t border-slate-200 px-4 py-2">
            <p className="text-[10px] text-slate-400">
              <kbd className="mr-1 rounded border border-slate-200 bg-slate-50 px-1 py-0.5 font-semibold">↑↓</kbd>
              Điều hướng
              <kbd className="ml-2 mr-1 rounded border border-slate-200 bg-slate-50 px-1 py-0.5 font-semibold">↵</kbd>
              Chọn
              <kbd className="ml-2 mr-1 rounded border border-slate-200 bg-slate-50 px-1 py-0.5 font-semibold">Esc</kbd>
              Đóng
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
