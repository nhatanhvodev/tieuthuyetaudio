import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchBox({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form action="/tim-kiem" className="flex w-full gap-2" role="search" aria-label="Tim kiem truyen">
      <label htmlFor="global-search-query" className="sr-only">
        Tu khoa tim kiem
      </label>
      <Input
        id="global-search-query"
        name="q"
        defaultValue={defaultValue}
        aria-label="Tim truyen"
        placeholder="Ten truyen, tac gia, giong doc"
        className="h-11"
      />
      <Button type="submit" className="min-h-11 min-w-11" aria-label="Thuc hien tim kiem">
        <Search data-icon="inline-start" aria-hidden="true" />
        Tim
      </Button>
    </form>
  );
}
