import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchBox({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form action="/tim-kiem" className="flex w-full gap-2">
      <Input name="q" defaultValue={defaultValue} aria-label="Tim truyen" className="h-11" />
      <Button type="submit">
        <Search data-icon="inline-start" />
        Tim
      </Button>
    </form>
  );
}
