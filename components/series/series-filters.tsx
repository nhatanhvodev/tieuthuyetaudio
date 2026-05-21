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

const selectClassName = "select select-bordered h-11 w-full bg-input text-sm";

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
    <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" role="search" aria-label="Bộ lọc kho truyện">
      <div className="relative sm:col-span-2 lg:col-span-3 xl:col-span-2">
        <label htmlFor="series-filter-q" className="sr-only">
          Từ khóa
        </label>
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input id="series-filter-q" name="q" defaultValue={q} aria-label="Từ khóa" placeholder="Tìm truyện, tác giả, giọng đọc" className="h-11 pl-9" />
      </div>

      <div>
        <label htmlFor="series-filter-category" className="sr-only">
          Thể loại
        </label>
        <Input id="series-filter-category" name="category" defaultValue={category} aria-label="Đường dẫn thể loại" placeholder="the-loai" className="h-11" />
      </div>

      <div>
        <label htmlFor="series-filter-status" className="sr-only">
          Trạng thái
        </label>
        <select id="series-filter-status" name="status" defaultValue={status} aria-label="Trạng thái" className={selectClassName}>
          <option value="">Tất cả</option>
          <option value="ONGOING">Đang cập nhật</option>
          <option value="COMPLETED">Hoàn thành</option>
        </select>
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

      <div>
        <label htmlFor="series-filter-min-episodes" className="sr-only">
          Số tập tối thiểu
        </label>
        <Input id="series-filter-min-episodes" name="minEpisodes" type="number" min={1} defaultValue={minEpisodes} aria-label="Số tập tối thiểu" placeholder="Tập từ" className="h-11" />
      </div>

      <div>
        <label htmlFor="series-filter-max-episodes" className="sr-only">
          Số tập tối đa
        </label>
        <Input id="series-filter-max-episodes" name="maxEpisodes" type="number" min={1} defaultValue={maxEpisodes} aria-label="Số tập tối đa" placeholder="Tập đến" className="h-11" />
      </div>

      <div>
        <label htmlFor="series-filter-min-rating" className="sr-only">
          Đánh giá tối thiểu
        </label>
        <Input id="series-filter-min-rating" name="minRating" type="number" min={0} max={5} step="0.1" defaultValue={minRating} aria-label="Đánh giá tối thiểu" placeholder="Điểm từ" className="h-11" />
      </div>

      <div>
        <label htmlFor="series-filter-has-audio" className="sr-only">
          Tình trạng audio
        </label>
        <select id="series-filter-has-audio" name="hasAudio" defaultValue={hasAudio} aria-label="Tình trạng audio" className={selectClassName}>
          <option value="">Có hoặc không</option>
          <option value="true">Có audio</option>
          <option value="false">Chưa có audio</option>
        </select>
      </div>

      <div>
        <label htmlFor="series-filter-completion" className="sr-only">
          Ưu tiên trạng thái hoàn thành
        </label>
        <select id="series-filter-completion" name="sortByCompletion" defaultValue={sortByCompletion} aria-label="Ưu tiên trạng thái hoàn thành" className={selectClassName}>
          <option value="">Mọi trạng thái</option>
          <option value="completed-first">Hoàn thành trước</option>
          <option value="ongoing-first">Đang cập nhật trước</option>
        </select>
      </div>

      <Button type="submit" className="min-h-11 sm:col-span-2 lg:col-span-3 xl:col-span-5 xl:justify-self-start">
        <Filter data-icon="inline-start" aria-hidden="true" />
        Lọc
      </Button>
    </form>
  );
}
