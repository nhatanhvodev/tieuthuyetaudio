"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EpisodeForm({ series }: { series: Array<{ id: string; title: string }> }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(formData: FormData) {
    setMessage("");
    startTransition(async () => {
      const response = await fetch("/api/admin/episodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seriesId: String(formData.get("seriesId") ?? ""),
          episodeNumber: Number(formData.get("episodeNumber") ?? 1),
          title: String(formData.get("title") ?? ""),
          audioUrl: String(formData.get("audioUrl") ?? ""),
          durationSeconds: Number(formData.get("durationSeconds") ?? 0) || undefined,
          isPremium: formData.get("isPremium") === "on"
        })
      });
      if (!response.ok) {
        setMessage("Khong the luu tap");
        return;
      }
      router.refresh();
    });
  }

  return (
    <form action={submit} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 text-slate-950 md:grid-cols-2">
      <div className="grid gap-2">
        <Label htmlFor="seriesId">Truyen</Label>
        <select id="seriesId" name="seriesId" className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
          {series.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="episodeNumber">So tap</Label>
        <Input id="episodeNumber" name="episodeNumber" type="number" min={1} className="bg-white text-slate-950" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="title">Ten tap</Label>
        <Input id="title" name="title" className="bg-white text-slate-950" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="durationSeconds">Thoi luong giay</Label>
        <Input id="durationSeconds" name="durationSeconds" type="number" className="bg-white text-slate-950" />
      </div>
      <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium md:mt-7">
        <input type="checkbox" name="isPremium" className="size-4" />
        Danh dau tap premium
      </label>
      <div className="grid gap-2 md:col-span-2">
        <Label htmlFor="audioUrl">URL audio</Label>
        <Input id="audioUrl" name="audioUrl" className="bg-white text-slate-950" />
      </div>
      {message ? <p className="text-sm text-red-600 md:col-span-2">{message}</p> : null}
      <Button type="submit" disabled={isPending} className="md:col-span-2">{isPending ? "Dang luu..." : "Them tap"}</Button>
    </form>
  );
}
