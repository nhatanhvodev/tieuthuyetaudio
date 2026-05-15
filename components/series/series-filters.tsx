import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SeriesFilters({
  q = "",
  category = "",
  status = "",
  sort = "newest"
}: {
  q?: string;
  category?: string;
  status?: string;
  sort?: string;
}) {
  return (
    <form className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[1fr_160px_160px_140px_auto]">
      <Input name="q" defaultValue={q} aria-label="Tu khoa" />
      <Input name="category" defaultValue={category} aria-label="Slug the loai" />
      <select name="status" defaultValue={status} aria-label="Trang thai" className="h-10 rounded-md border bg-input px-3 text-sm">
        <option value="">Tat ca</option>
        <option value="ONGOING">Dang cap nhat</option>
        <option value="COMPLETED">Hoan thanh</option>
      </select>
      <select name="sort" defaultValue={sort} aria-label="Sap xep" className="h-10 rounded-md border bg-input px-3 text-sm">
        <option value="newest">Moi nhat</option>
        <option value="popular">Nghe nhieu</option>
        <option value="rating">Rating cao</option>
      </select>
      <Button type="submit">Loc</Button>
    </form>
  );
}
