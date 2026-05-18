import { Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SeriesFiltersProps = {
  q?: string;
  category?: string;
  status?: string;
  sort?: string;
  minEpisodes?: string;
  maxEpisodes?: string;
  minRating?: string;
  hasAudio?: string;
  sortByCompletion?: string;
};

const selectClassName =
  "h-11 rounded-md border bg-input px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function SeriesFilters({
  q = "",
  category = "",
  status = "",
  sort = "newest",
  minEpisodes = "",
  maxEpisodes = "",
  minRating = "",
  hasAudio = "",
  sortByCompletion = ""
}: SeriesFiltersProps) {
  return (
    <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.2fr_180px_170px_150px_130px_130px_130px_180px_auto]" role="search" aria-label="Bo loc kho truyen">
      <div className="relative md:col-span-2 xl:col-span-1">
        <label htmlFor="series-filter-q" className="sr-only">
          Tu khoa
        </label>
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input id="series-filter-q" name="q" defaultValue={q} aria-label="Tu khoa" placeholder="Tim truyen, tac gia, giong doc" className="h-11 pl-9" />
      </div>

      <div>
        <label htmlFor="series-filter-category" className="sr-only">
          The loai
        </label>
        <Input id="series-filter-category" name="category" defaultValue={category} aria-label="Duong dan the loai" placeholder="the-loai" className="h-11" />
      </div>

      <div>
        <label htmlFor="series-filter-status" className="sr-only">
          Trang thai
        </label>
        <select id="series-filter-status" name="status" defaultValue={status} aria-label="Trang thai" className={selectClassName}>
          <option value="">Tat ca</option>
          <option value="ONGOING">Dang cap nhat</option>
          <option value="COMPLETED">Hoan thanh</option>
        </select>
      </div>

      <div>
        <label htmlFor="series-filter-sort" className="sr-only">
          Sap xep
        </label>
        <select id="series-filter-sort" name="sort" defaultValue={sort} aria-label="Sap xep" className={selectClassName}>
          <option value="newest">Moi nhat</option>
          <option value="popular">Nghe nhieu</option>
          <option value="rating">Danh gia cao</option>
        </select>
      </div>

      <div>
        <label htmlFor="series-filter-min-episodes" className="sr-only">
          So tap toi thieu
        </label>
        <Input id="series-filter-min-episodes" name="minEpisodes" type="number" min={1} defaultValue={minEpisodes} aria-label="So tap toi thieu" placeholder="Tap tu" className="h-11" />
      </div>

      <div>
        <label htmlFor="series-filter-max-episodes" className="sr-only">
          So tap toi da
        </label>
        <Input id="series-filter-max-episodes" name="maxEpisodes" type="number" min={1} defaultValue={maxEpisodes} aria-label="So tap toi da" placeholder="Tap den" className="h-11" />
      </div>

      <div>
        <label htmlFor="series-filter-min-rating" className="sr-only">
          Danh gia toi thieu
        </label>
        <Input id="series-filter-min-rating" name="minRating" type="number" min={0} max={5} step="0.1" defaultValue={minRating} aria-label="Danh gia toi thieu" placeholder="Diem tu" className="h-11" />
      </div>

      <div>
        <label htmlFor="series-filter-has-audio" className="sr-only">
          Tinh trang audio
        </label>
        <select id="series-filter-has-audio" name="hasAudio" defaultValue={hasAudio} aria-label="Tinh trang audio" className={selectClassName}>
          <option value="">Co hoac khong</option>
          <option value="true">Co audio</option>
          <option value="false">Chua co audio</option>
        </select>
      </div>

      <div>
        <label htmlFor="series-filter-completion" className="sr-only">
          Uu tien trang thai hoan thanh
        </label>
        <select id="series-filter-completion" name="sortByCompletion" defaultValue={sortByCompletion} aria-label="Uu tien trang thai hoan thanh" className={selectClassName}>
          <option value="">Moi trang thai</option>
          <option value="completed-first">Hoan thanh truoc</option>
          <option value="ongoing-first">Dang cap nhat truoc</option>
        </select>
      </div>

      <Button type="submit" className="min-h-11 min-w-11">
        <Filter data-icon="inline-start" aria-hidden="true" />
        Loc
      </Button>
    </form>
  );
}
