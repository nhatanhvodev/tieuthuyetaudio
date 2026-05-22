import Link from "next/link";
import { Filter, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CategoryOption = {
  slug: string;
  name: string;
  count: number;
};

type SeriesFiltersProps = {
  q?: string;
  category?: string;
  status?: string;
  sort?: string;
  minEpisodes?: string;
  maxEpisodes?: string;
  minRating?: string;
  sortByCompletion?: string;
  categories?: CategoryOption[];
};

const selectClassName =
  "select select-bordered select-sm md:select-md h-10 md:h-11 w-full rounded-xl bg-base-100/90 text-sm";
const compactInputClassName = "h-10 md:h-11 rounded-xl bg-base-100/90";

export function SeriesFilters({
  q = "",
  category = "",
  status = "",
  sort = "newest",
  minEpisodes = "",
  maxEpisodes = "",
  minRating = "",
  sortByCompletion = "",
  categories = []
}: SeriesFiltersProps) {
  const hasActiveFilters = Boolean(
    q || category || status || minEpisodes || maxEpisodes || minRating || sortByCompletion || sort !== "newest"
  );

  return (
    <form className="space-y-3" role="search" aria-label="Bộ lọc kho truyện">
      <div className="grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(170px,220px)_auto_auto] sm:items-center">
        <div className="relative sm:col-span-2">
          <label htmlFor="series-filter-q" className="sr-only">
            Từ khóa
          </label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="series-filter-q"
            name="q"
            defaultValue={q}
            aria-label="Từ khóa"
            placeholder="Tìm truyện, tác giả, giọng đọc"
            className={cn(compactInputClassName, "pl-9")}
          />
        </div>

        <div>
          <label htmlFor="series-filter-sort" className="sr-only">
            Sắp xếp
          </label>
          <select id="series-filter-sort" name="sort" defaultValue={sort} aria-label="Sắp xếp" className={selectClassName}>
            <option value="newest">Mới nhất</option>
            <option value="popular">Nghe nhiều</option>
            <option value="rating">Đánh giá cao</option>
          </select>
        </div>

        <Button type="submit" className="h-10 min-h-10 rounded-xl px-4 md:h-11 md:min-h-11">
          <Filter data-icon="inline-start" aria-hidden="true" />
          Lọc
        </Button>

        <Button asChild type="button" variant="ghost" className="h-10 rounded-xl px-3 md:h-11">
          <Link href="/truyen">
            <RotateCcw data-icon="inline-start" aria-hidden="true" />
            Xóa lọc
          </Link>
        </Button>
      </div>

      <div className={cn("collapse collapse-arrow border border-[color-mix(in_oklch,var(--foreground)_10%,transparent)] bg-base-100/60", hasActiveFilters && "collapse-open", "md:collapse-open")}>
        <input type="checkbox" defaultChecked={hasActiveFilters} className="md:hidden" />
        <div className="collapse-title min-h-0 py-3 text-sm font-semibold md:hidden">Bộ lọc nâng cao</div>
        <div className="collapse-content px-3 pb-3 pt-1 md:px-4 md:pb-4 md:pt-4">
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
            <div className="col-span-2">
              <label htmlFor="series-filter-category" className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Thể loại
              </label>
              {categories.length ? (
                <select
                  id="series-filter-category"
                  name="category"
                  defaultValue={category}
                  aria-label="Thể loại"
                  className={selectClassName}
                >
                  <option value="">Tất cả thể loại</option>
                  {categories.map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.name} ({item.count})
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id="series-filter-category"
                  name="category"
                  defaultValue={category}
                  aria-label="Đường dẫn thể loại"
                  placeholder="the-loai"
                  className={compactInputClassName}
                />
              )}
            </div>

            <div>
              <label htmlFor="series-filter-status" className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Trạng thái
              </label>
              <select id="series-filter-status" name="status" defaultValue={status} aria-label="Trạng thái" className={selectClassName}>
                <option value="">Tất cả</option>
                <option value="ONGOING">Đang cập nhật</option>
                <option value="COMPLETED">Hoàn thành</option>
              </select>
            </div>

            <div>
              <label htmlFor="series-filter-min-episodes" className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Tập từ
              </label>
              <Input
                id="series-filter-min-episodes"
                name="minEpisodes"
                type="number"
                min={1}
                defaultValue={minEpisodes}
                aria-label="Số tập tối thiểu"
                placeholder="0"
                className={compactInputClassName}
              />
            </div>

            <div>
              <label htmlFor="series-filter-max-episodes" className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Tập đến
              </label>
              <Input
                id="series-filter-max-episodes"
                name="maxEpisodes"
                type="number"
                min={1}
                defaultValue={maxEpisodes}
                aria-label="Số tập tối đa"
                placeholder="999"
                className={compactInputClassName}
              />
            </div>

            <div>
              <label htmlFor="series-filter-min-rating" className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Điểm từ
              </label>
              <Input
                id="series-filter-min-rating"
                name="minRating"
                type="number"
                min={0}
                max={5}
                step="0.1"
                defaultValue={minRating}
                aria-label="Đánh giá tối thiểu"
                placeholder="0.0"
                className={compactInputClassName}
              />
            </div>

            <div className="col-span-2 md:col-span-3 xl:col-span-2">
              <label htmlFor="series-filter-completion" className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Ưu tiên hoàn thành
              </label>
              <select
                id="series-filter-completion"
                name="sortByCompletion"
                defaultValue={sortByCompletion}
                aria-label="Ưu tiên trạng thái hoàn thành"
                className={selectClassName}
              >
                <option value="">Mọi trạng thái</option>
                <option value="completed-first">Hoàn thành trước</option>
                <option value="ongoing-first">Đang cập nhật trước</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
