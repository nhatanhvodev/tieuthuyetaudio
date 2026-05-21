"use client";

import { useRef, useState, useTransition } from "react";
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
import { toastSuccess, toastError } from "@/lib/admin/toast-utils";

const formSchema = seriesInputSchema.extend({
  coverUrl: z.string().trim().min(1, "Vui lòng upload ảnh bìa")
});

type FormData = z.input<typeof formSchema>;

type SeriesFormValue = {
  id?: string;
  title?: string;
  slug?: string;
  description?: string | null;
  producer?: string | null;
  status?: "ONGOING" | "COMPLETED";
  coverUrl?: string | null;
  categories?: Array<{ categoryId: string }>;
};

type CategoryOption = {
  id: string;
  name: string;
};

export function SeriesForm({ value = {}, categories }: { value?: SeriesFormValue; categories: CategoryOption[] }) {
  const router = useRouter();
  const coverFileRef = useRef<HTMLInputElement | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [isPending, startTransition] = useTransition();

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
      coverUrl: value.coverUrl ?? "",
      categoryIds: Array.from(selectedCategoryIds)
    }
  });

  const coverUrl = watch("coverUrl");

  async function uploadCover() {
    const file = coverFileRef.current?.files?.[0];
    if (!file) {
      toastError("Vui lòng chọn file ảnh bìa.");
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
        toastError(payload?.error ?? "Không thể upload ảnh bìa.");
        return;
      }

      const nextCoverUrl = String(payload?.url ?? "").trim();
      if (!nextCoverUrl) {
        toastError("Upload thành công nhưng không nhận được URL ảnh bìa.");
        return;
      }

      setValue("coverUrl", nextCoverUrl, { shouldValidate: true });
      toastSuccess("Upload ảnh bìa thành công.");
    } finally {
      setUploadingCover(false);
    }
  }

  async function submit(data: FormData) {
    startTransition(async () => {
      const payload = {
        title: data.title,
        slug: data.slug,
        description: data.description ?? "",
        producer: data.producer ?? "",
        status: data.status,
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
        toastError(errorPayload?.error ?? "Không thể lưu truyện");
        return;
      }

      toastSuccess(value.id ? "Đã cập nhật truyện." : "Đã thêm truyện mới.");
      router.push("/admin/truyen");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="admin-panel grid gap-4 rounded-2xl p-5">
      <div className="grid gap-2">
        <Label htmlFor="title">Tên truyện</Label>
        <Input id="title" {...register("title")} />
        {errors.title ? <p className="text-sm text-red-600">{errors.title.message}</p> : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="slug">Đường dẫn slug</Label>
        <Input id="slug" {...register("slug")} />
        {errors.slug ? <p className="text-sm text-red-600">{errors.slug.message}</p> : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="producer">Nhà sản xuất</Label>
        <Input id="producer" {...register("producer")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="status">Trạng thái</Label>
        <select id="status" {...register("status")} className="admin-select select select-bordered h-10 w-full text-sm">
          <option value="ONGOING">Đang cập nhật</option>
          <option value="COMPLETED">Hoàn thành</option>
        </select>
      </div>

      <div className="admin-panel rounded-xl border-dashed p-4">
        <p className="text-sm font-semibold text-slate-900">Ảnh bìa truyện (upload file)</p>
        <p className="mt-1 text-xs text-slate-500">Chỉ nhận ảnh raster: JPG, PNG, WEBP, AVIF, GIF. Không hỗ trợ SVG.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Input ref={coverFileRef} id="coverFile" type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="max-w-xl" />
          <Button type="button" onClick={uploadCover} disabled={uploadingCover}>
            {uploadingCover ? "Đang upload..." : "Upload ảnh bìa"}
          </Button>
        </div>
        <div className="mt-3 grid gap-2">
          <Label htmlFor="coverUrl">Đường dẫn ảnh bìa</Label>
          <Input id="coverUrl" {...register("coverUrl")} />
          {errors.coverUrl ? <p className="text-sm text-red-600">{errors.coverUrl.message}</p> : null}
        </div>
        {coverUrl ? (
          <div className="relative mt-3 h-56 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            <CoverImage src={coverUrl} alt="Preview ảnh bìa" sizes="(max-width: 768px) 100vw, 560px" className="absolute inset-0 size-full object-cover" />
          </div>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea id="description" {...register("description")} />
        {errors.description ? <p className="text-sm text-red-600">{errors.description.message}</p> : null}
      </div>

      <fieldset className="grid gap-2 rounded-md border border-border/80 p-3">
        <legend className="px-1 text-sm font-semibold">Thể loại</legend>
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
        {isPending ? "Đang lưu..." : "Lưu truyện"}
      </Button>
    </form>
  );
}
