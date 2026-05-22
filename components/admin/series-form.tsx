"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CoverImage } from "@/components/common/cover-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { seriesInputSchema } from "@/lib/admin/validators";
import { toastError, toastSuccess } from "@/lib/admin/toast-utils";

const formSchema = seriesInputSchema.extend({
  coverUrl: z.string().trim().min(1, "Vui long upload anh bia")
});

type FormData = z.input<typeof formSchema>;

type SeriesFormValue = {
  id?: string;
  title?: string;
  slug?: string;
  description?: string | null;
  producer?: string | null;
  status?: "ONGOING" | "COMPLETED";
  seriesType?: "MULTI_EPISODE" | "ONE_SHOT";
  coverUrl?: string | null;
  categories?: Array<{ categoryId: string }>;
};

type CategoryOption = {
  id: string;
  name: string;
};

function createSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .replace(/-{2,}/g, "-");
}

export function SeriesForm({ value = {}, categories }: { value?: SeriesFormValue; categories: CategoryOption[] }) {
  const router = useRouter();
  const coverFileRef = useRef<HTMLInputElement | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const selectedCategoryIds = new Set((value.categories ?? []).map((item) => item.categoryId));

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: value.title ?? "",
      slug: value.slug ?? "",
      description: value.description ?? "",
      producer: value.producer ?? "",
      status: value.status ?? "ONGOING",
      seriesType: value.seriesType ?? "MULTI_EPISODE",
      coverUrl: value.coverUrl ?? "",
      categoryIds: Array.from(selectedCategoryIds)
    }
  });

  const titleField = register("title");
  const slugField = register("slug");
  const statusField = register("status");
  const seriesTypeField = register("seriesType");
  const coverUrl = watch("coverUrl");
  const seriesType = watch("seriesType");

  async function uploadCover() {
    const file = coverFileRef.current?.files?.[0];
    if (!file) {
      toastError("Vui long chon file anh bia.");
      return;
    }

    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/cover-upload", {
        method: "POST",
        body: formData
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        toastError(payload?.error ?? "Khong the upload anh bia.");
        return;
      }

      const nextCoverUrl = String(payload?.url ?? "").trim();
      if (!nextCoverUrl) {
        toastError("Upload thanh cong nhung khong nhan duoc URL anh bia.");
        return;
      }

      setValue("coverUrl", nextCoverUrl, { shouldValidate: true });
      toastSuccess("Upload anh bia thanh cong.");
    } finally {
      setUploadingCover(false);
    }
  }

  async function submit(data: FormData) {
    startTransition(async () => {
      const payload = {
        title: data.title,
        slug: data.slug || createSlug(data.title),
        description: data.description ?? "",
        producer: data.producer ?? "",
        status: data.seriesType === "ONE_SHOT" ? "COMPLETED" : data.status,
        seriesType: data.seriesType,
        coverUrl: data.coverUrl,
        categoryIds: data.categoryIds
      };

      const response = await fetch(value.id ? `/api/admin/series/${value.id}` : "/api/admin/series", {
        method: value.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        toastError(errorPayload?.error ?? "Khong the luu truyen");
        return;
      }

      const saved = await response.json().catch(() => null);
      const savedSeriesId = typeof saved?.id === "string" ? saved.id : value.id;

      toastSuccess(value.id ? "Da cap nhat truyen." : "Da them truyen moi.");
      if (!value.id && data.seriesType === "ONE_SHOT" && savedSeriesId) {
        router.push(`/admin/tap?seriesId=${savedSeriesId}`);
        router.refresh();
        return;
      }

      router.push("/admin/truyen");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="admin-panel grid gap-4 rounded-2xl p-5">
      <div className="grid gap-2">
        <Label htmlFor="title">Ten truyen</Label>
        <Input
          id="title"
          {...titleField}
          onChange={(event) => {
            titleField.onChange(event);
            if (value.id || slugManuallyEdited) return;
            const nextSlug = createSlug(event.target.value);
            setValue("slug", nextSlug, { shouldValidate: true, shouldDirty: true });
          }}
        />
        {errors.title ? <p className="text-sm text-red-600">{errors.title.message}</p> : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="slug">Duong dan slug</Label>
        <Input
          id="slug"
          {...slugField}
          onFocus={() => {
            if (!value.id) setSlugManuallyEdited(true);
          }}
          onChange={(event) => {
            slugField.onChange(event);
            if (!value.id) setSlugManuallyEdited(true);
          }}
        />
        {errors.slug ? <p className="text-sm text-red-600">{errors.slug.message}</p> : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="producer">Nha san xuat</Label>
        <Input id="producer" {...register("producer")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="status">Trang thai</Label>
        <select
          id="status"
          {...statusField}
          disabled={seriesType === "ONE_SHOT"}
          className="admin-select select select-bordered h-10 w-full text-sm"
        >
          <option value="ONGOING">Dang cap nhat</option>
          <option value="COMPLETED">Hoan thanh</option>
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="seriesType">Loai truyen</Label>
        <select
          id="seriesType"
          {...seriesTypeField}
          onChange={(event) => {
            seriesTypeField.onChange(event);
            if (event.target.value === "ONE_SHOT") {
              setValue("status", "COMPLETED", { shouldDirty: true, shouldValidate: true });
            }
          }}
          className="admin-select select select-bordered h-10 w-full text-sm"
        >
          <option value="MULTI_EPISODE">Nhieu tap</option>
          <option value="ONE_SHOT">Tap ngan (1 tap)</option>
        </select>
      </div>

      <div className="admin-panel rounded-xl border-dashed p-4">
        <p className="text-sm font-semibold text-slate-900">Anh bia truyen (upload file)</p>
        <p className="mt-1 text-xs text-slate-500">Chi nhan anh raster: JPG, PNG, WEBP, AVIF, GIF. Khong ho tro SVG.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Input ref={coverFileRef} id="coverFile" type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="max-w-xl" />
          <Button type="button" onClick={uploadCover} disabled={uploadingCover}>
            {uploadingCover ? "Dang upload..." : "Upload anh bia"}
          </Button>
        </div>
        <div className="mt-3 grid gap-2">
          <input type="hidden" {...register("coverUrl")} />
          {coverUrl ? <p className="text-xs text-slate-500">Da nhan duong dan anh bia tu upload.</p> : null}
          {errors.coverUrl ? <p className="text-sm text-red-600">{errors.coverUrl.message}</p> : null}
        </div>
        {coverUrl ? (
          <div className="relative mt-3 h-56 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            <CoverImage src={coverUrl} alt="Preview anh bia" sizes="(max-width: 768px) 100vw, 560px" className="absolute inset-0 size-full object-cover" />
          </div>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Mo ta</Label>
        <Textarea id="description" {...register("description")} />
        {errors.description ? <p className="text-sm text-red-600">{errors.description.message}</p> : null}
      </div>

      <fieldset className="grid gap-2 rounded-md border border-border/80 p-3">
        <legend className="px-1 text-sm font-semibold">The loai</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-2 rounded-md border border-border/80 px-3 py-2 text-sm">
              <input
                type="checkbox"
                value={category.id}
                defaultChecked={selectedCategoryIds.has(category.id)}
                {...register("categoryIds")}
                className="checkbox checkbox-sm"
              />
              {category.name}
            </label>
          ))}
        </div>
        {errors.categoryIds ? <p className="text-sm text-red-600">{errors.categoryIds.message}</p> : null}
      </fieldset>

      <Button type="submit" disabled={isPending || uploadingCover}>
        {isPending ? "Dang luu..." : "Luu truyen"}
      </Button>
      {value.id && seriesType === "ONE_SHOT" ? (
        <Button asChild variant="secondary">
          <Link href={`/admin/tap?seriesId=${value.id}`}>Upload audio tap ngan</Link>
        </Button>
      ) : null}
    </form>
  );
}
