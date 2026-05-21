import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchBox({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form action="/tim-kiem" className="flex w-full gap-2" role="search" aria-label="Tìm kiếm truyện">
      <label htmlFor="global-search-query" className="sr-only">
        Từ khóa tìm kiếm
      </label>
      <Input
        id="global-search-query"
        name="q"
        defaultValue={defaultValue}
        aria-label="Tìm truyện"
        placeholder="Tên truyện, tác giả, giọng đọc"
        className="h-11"
      />
      <Button type="submit" className="min-h-11 min-w-11" aria-label="Thực hiện tìm kiếm">
        <Search data-icon="inline-start" aria-hidden="true" />
        Tìm
      </Button>
    </form>
  );
}
