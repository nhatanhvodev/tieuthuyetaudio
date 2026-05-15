import Link from "next/link";

const links = [
  { href: "/admin", label: "Tong quan" },
  { href: "/admin/truyen", label: "Truyen" },
  { href: "/admin/tap", label: "Tap" },
  { href: "/admin/nguoi-dung", label: "Nguoi dung" }
];

export function AdminNav() {
  return (
    <nav className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
