"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type SeriesFormValue = {
  id?: string;
  title?: string;
  slug?: string;
  description?: string | null;
  producer?: string | null;
  status?: "ONGOING" | "COMPLETED";
  coverUrl?: string | null;
};

export function SeriesForm({ value = {} }: { value?: SeriesFormValue }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(formData: FormData) {
    setMessage("");
    startTransition(async () => {
      const payload = {
        title: String(formData.get("title") ?? ""),
        slug: String(formData.get("slug") ?? ""),
        description: String(formData.get("description") ?? ""),
        producer: String(formData.get("producer") ?? ""),
        status: String(formData.get("status") ?? "ONGOING"),
        coverUrl: String(formData.get("coverUrl") ?? "")
      };
      const response = await fetch(value.id ? `/api/admin/series/${value.id}` : "/api/admin/series", {
        method: value.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        setMessage("Khong the luu truyen");
        return;
      }
      router.push("/admin/truyen");
      router.refresh();
    });
  }

  return (
    <form action={submit} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 text-slate-950">
      <div className="grid gap-2">
        <Label htmlFor="title">Ten truyen</Label>
        <Input id="title" name="title" defaultValue={value.title} className="bg-white text-slate-950" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={value.slug} className="bg-white text-slate-950" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="producer">Nha san xuat</Label>
        <Input id="producer" name="producer" defaultValue={value.producer ?? ""} className="bg-white text-slate-950" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="status">Trang thai</Label>
        <select id="status" name="status" defaultValue={value.status ?? "ONGOING"} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
          <option value="ONGOING">Dang cap nhat</option>
          <option value="COMPLETED">Hoan thanh</option>
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="coverUrl">Cover URL</Label>
        <Input id="coverUrl" name="coverUrl" defaultValue={value.coverUrl ?? ""} className="bg-white text-slate-950" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Mo ta</Label>
        <Textarea id="description" name="description" defaultValue={value.description ?? ""} className="bg-white text-slate-950" />
      </div>
      {message ? <p className="text-sm text-red-600">{message}</p> : null}
      <Button type="submit" disabled={isPending}>{isPending ? "Dang luu..." : "Luu truyen"}</Button>
    </form>
  );
}
