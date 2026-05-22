"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChunkedUpload } from "@/hooks/use-chunked-upload";
import { episodeInputSchema } from "@/lib/admin/validators";
import { toastSuccess, toastError } from "@/lib/admin/toast-utils";
import { MAX_FILE_SIZE } from "@/lib/upload/constants";

const formSchema = episodeInputSchema.extend({
  audioUrl: z.string().trim().min(1, "Vui long upload hoac nhap URL audio")
});

type FormData = z.input<typeof formSchema>;

type EpisodeFormValue = {
  id?: string;
  seriesId?: string;
  episodeNumber?: number;
  title?: string;
  durationSeconds?: number | null;
  isPremium?: boolean;
  audioUrl?: string | null;
};

export function EpisodeForm({
  series,
  value,
  initialSeriesId,
  redirectTo = "/admin/tap"
}: {
  series: Array<{ id: string; title: string }>;
  value?: EpisodeFormValue;
  initialSeriesId?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      seriesId:
        value?.seriesId ??
        (initialSeriesId && series.some((item) => item.id === initialSeriesId) ? initialSeriesId : series[0]?.id ?? ""),
      title: value?.title ?? "",
      isPremium: value?.isPremium ?? false,
      audioUrl: value?.audioUrl ?? ""
    }
  });

  const audioUrl = watch("audioUrl");

  const { uploading, progress, error: uploadError, upload, cancel: cancelUpload, reset: resetUpload } = useChunkedUpload({
    onComplete(url) {
      setValue("audioUrl", url, { shouldValidate: true });
      toastSuccess("Upload audio thanh cong. URL da duoc tu dong dien.");
    },
    onError(err) {
      toastError(err);
    }
  });

  async function handleUploadClick() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toastError("Vui long chon file audio de upload.");
      return;
    }

    resetUpload();
    await upload(file);
  }

  function handleCancelUpload() {
    cancelUpload();
    toastSuccess("Da huy upload.");
  }

  function submit(data: FormData) {
    startTransition(async () => {
      const response = await fetch(value?.id ? `/api/admin/episodes/${value.id}` : "/api/admin/episodes", {
        method: value?.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seriesId: data.seriesId,
          title: data.title,
          audioUrl: data.audioUrl,
          isPremium: data.isPremium
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        toastError(payload?.error ?? "Khong the luu tap");
        return;
      }

      toastSuccess(value?.id ? "Da cap nhat tap." : "Da them tap moi.");
      router.push(redirectTo);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="admin-panel grid gap-4 rounded-2xl p-5 md:grid-cols-2">
      <div className="admin-panel rounded-xl border-dashed p-4 md:col-span-2">
        <p className="text-sm font-semibold text-slate-900">Luong them audio truc tiep</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">
          <li>Chon file audio ngay trong form.</li>
          <li>Nhan Upload de he thong tai file len server theo tung phan (chunked).</li>
          <li>URL audio se tu dong dien de ban luu tap.</li>
        </ol>
        <p className="mt-2 text-xs text-slate-500">
          Ho tro file lon den {MAX_FILE_SIZE / 1024 / 1024}MB. Upload theo chunk 5MB, co the huy giua chung.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="seriesId">Truyen</Label>
        <select id="seriesId" {...register("seriesId")} className="admin-select select select-bordered h-10 w-full text-sm">
          {series.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
        {errors.seriesId ? <p className="text-sm text-red-600">{errors.seriesId.message}</p> : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="title">Ten tap</Label>
        <Input id="title" {...register("title")} />
        {errors.title ? <p className="text-sm text-red-600">{errors.title.message}</p> : null}
      </div>

      <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium md:col-span-2">
        <input type="checkbox" {...register("isPremium")} className="checkbox checkbox-sm" />
        Danh dau tap premium
      </label>

      <div className="grid gap-2 md:col-span-2">
        <Label htmlFor="audioFile">File audio</Label>
        <div className="flex flex-wrap items-center gap-2">
          <Input ref={fileInputRef} id="audioFile" type="file" accept="audio/*" className="max-w-xl" disabled={uploading} />
          {uploading ? (
            <Button type="button" variant="error" onClick={handleCancelUpload}>
              Huy upload
            </Button>
          ) : (
            <Button type="button" onClick={handleUploadClick} disabled={isPending}>
              Upload audio
            </Button>
          )}
        </div>
        <p className="text-xs text-slate-500">
          Ho tro: mp3, m4a, aac, ogg, wav, flac. Toi da {MAX_FILE_SIZE / 1024 / 1024}MB. Upload theo chunk 5MB.
        </p>
      </div>

      {uploading && (
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-medium text-slate-600">{progress}%</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Dang upload... {progress}% hoan thanh.</p>
        </div>
      )}

      <div className="grid gap-2 md:col-span-2">
        <Label htmlFor="audioUrl">URL audio</Label>
        <Input id="audioUrl" {...register("audioUrl")} placeholder="https://.../ten-file.mp3" />
        {errors.audioUrl ? <p className="text-sm text-red-600">{errors.audioUrl.message}</p> : null}
      </div>

      {audioUrl?.trim() ? (
        <div className="admin-panel rounded-xl p-4 md:col-span-2">
          <p className="text-sm font-semibold text-slate-900">Nghe thu audio</p>
          <audio className="mt-2 w-full" controls preload="none" src={audioUrl.trim()}>
            Trinh duyet khong ho tro phat audio.
          </audio>
        </div>
      ) : null}

      {uploadError ? <p className="text-sm text-red-600 md:col-span-2">{uploadError}</p> : null}
      <Button type="submit" disabled={isPending || uploading} className="md:col-span-2">
        {isPending ? "Dang luu..." : value?.id ? "Cap nhat tap" : "Them tap"}
      </Button>
    </form>
  );
}
