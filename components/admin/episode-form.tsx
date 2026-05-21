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
  audioUrl: z.string().trim().min(1, "Vui lòng upload hoặc nhập URL audio")
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
  redirectTo = "/admin/tap"
}: {
  series: Array<{ id: string; title: string }>;
  value?: EpisodeFormValue;
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
      seriesId: value?.seriesId ?? series[0]?.id ?? "",
      episodeNumber: value?.episodeNumber ?? 1,
      title: value?.title ?? "",
      durationSeconds: value?.durationSeconds ?? undefined,
      isPremium: value?.isPremium ?? false,
      audioUrl: value?.audioUrl ?? ""
    }
  });

  const audioUrl = watch("audioUrl");

  const { uploading, progress, error: uploadError, upload, cancel: cancelUpload, reset: resetUpload } = useChunkedUpload({
    onComplete(url) {
      setValue("audioUrl", url, { shouldValidate: true });
      toastSuccess("Upload audio thành công. URL đã được tự động điền.");
    },
    onError(err) {
      toastError(err);
    }
  });

  async function handleUploadClick() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toastError("Vui lòng chọn file audio để upload.");
      return;
    }

    resetUpload();
    await upload(file);
  }

  function handleCancelUpload() {
    cancelUpload();
    toastSuccess("Đã hủy upload.");
  }

  function submit(data: FormData) {
    startTransition(async () => {
      const response = await fetch(value?.id ? `/api/admin/episodes/${value.id}` : "/api/admin/episodes", {
        method: value?.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seriesId: data.seriesId,
          episodeNumber: data.episodeNumber,
          title: data.title,
          audioUrl: data.audioUrl,
          durationSeconds: data.durationSeconds || undefined,
          isPremium: data.isPremium
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        toastError(payload?.error ?? "Không thể lưu tập");
        return;
      }

      toastSuccess(value?.id ? "Đã cập nhật tập." : "Đã thêm tập mới.");
      router.push(redirectTo);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="admin-panel grid gap-4 rounded-2xl p-5 md:grid-cols-2">
      <div className="admin-panel rounded-xl border-dashed p-4 md:col-span-2">
        <p className="text-sm font-semibold text-slate-900">Luồng thêm audio trực tiếp</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">
          <li>Chọn file audio ngay trong form.</li>
          <li>Nhấn Upload để hệ thống tải file lên server theo từng phần (chunked).</li>
          <li>URL audio sẽ tự động điền để bạn lưu tập.</li>
        </ol>
        <p className="mt-2 text-xs text-slate-500">
          Hỗ trợ file lớn đến {MAX_FILE_SIZE / 1024 / 1024}MB. Upload theo chunk 5MB, có thể hủy giữa chừng.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="seriesId">Truyện</Label>
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
        <Label htmlFor="episodeNumber">Số tập</Label>
        <Input id="episodeNumber" type="number" min={1} {...register("episodeNumber", { valueAsNumber: true })} />
        {errors.episodeNumber ? <p className="text-sm text-red-600">{errors.episodeNumber.message}</p> : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="title">Tên tập</Label>
        <Input id="title" {...register("title")} />
        {errors.title ? <p className="text-sm text-red-600">{errors.title.message}</p> : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="durationSeconds">Thời lượng (giây)</Label>
        <Input id="durationSeconds" type="number" {...register("durationSeconds", { valueAsNumber: true })} />
      </div>
      <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium md:mt-7">
        <input type="checkbox" {...register("isPremium")} className="checkbox checkbox-sm" />
        Đánh dấu tập premium
      </label>

      <div className="grid gap-2 md:col-span-2">
        <Label htmlFor="audioFile">File audio</Label>
        <div className="flex flex-wrap items-center gap-2">
          <Input ref={fileInputRef} id="audioFile" type="file" accept="audio/*" className="max-w-xl" disabled={uploading} />
          {uploading ? (
            <Button type="button" variant="error" onClick={handleCancelUpload}>
              Hủy upload
            </Button>
          ) : (
            <Button type="button" onClick={handleUploadClick} disabled={isPending}>
              Upload audio
            </Button>
          )}
        </div>
        <p className="text-xs text-slate-500">
          Hỗ trợ: mp3, m4a, aac, ogg, wav, flac. Tối đa {MAX_FILE_SIZE / 1024 / 1024}MB. Upload theo chunk 5MB.
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
          <p className="mt-1 text-xs text-slate-500">Đang upload... {progress}% hoàn thành.</p>
        </div>
      )}

      <div className="grid gap-2 md:col-span-2">
        <Label htmlFor="audioUrl">URL audio</Label>
        <Input id="audioUrl" {...register("audioUrl")} placeholder="https://.../ten-file.mp3" />
        {errors.audioUrl ? <p className="text-sm text-red-600">{errors.audioUrl.message}</p> : null}
      </div>

      {audioUrl?.trim() ? (
        <div className="admin-panel rounded-xl p-4 md:col-span-2">
          <p className="text-sm font-semibold text-slate-900">Nghe thử audio</p>
          <audio className="mt-2 w-full" controls preload="none" src={audioUrl.trim()}>
            Trình duyệt không hỗ trợ phát audio.
          </audio>
        </div>
      ) : null}

      {uploadError ? <p className="text-sm text-red-600 md:col-span-2">{uploadError}</p> : null}
      <Button type="submit" disabled={isPending || uploading} className="md:col-span-2">
        {isPending ? "Đang lưu..." : value?.id ? "Cập nhật tập" : "Thêm tập"}
      </Button>
    </form>
  );
}
