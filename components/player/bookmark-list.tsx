import { Clock3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatSeconds } from "@/lib/format";
import type { BookmarkTimelineItem } from "@/lib/bookmarks/validators";

type BookmarkListProps = {
  bookmarks: BookmarkTimelineItem[];
  currentSeconds: number;
  deletingBookmarkId: string | null;
  onDelete: (bookmarkId: string) => void;
  onJump: (second: number) => void;
};

export function BookmarkList({
  bookmarks,
  currentSeconds,
  deletingBookmarkId,
  onDelete,
  onJump
}: BookmarkListProps) {
  if (!bookmarks.length) {
    return <p className="mt-3 text-sm text-muted-foreground">Chua co moc nghe nao cho tap nay.</p>;
  }

  return (
    <div className="mt-4 space-y-2">
      {bookmarks.map((bookmark) => {
        const isNearby = Math.abs(currentSeconds - bookmark.second) <= 5;

        return (
          <div
            key={bookmark.id}
            className="flex items-start justify-between gap-3 rounded-md border bg-background/60 p-3"
          >
            <button
              type="button"
              onClick={() => onJump(bookmark.second)}
              className="flex min-w-0 flex-1 items-start gap-3 text-left"
            >
              <span className="mt-0.5 rounded-full bg-secondary p-2 text-secondary-foreground">
                <Clock3 aria-hidden="true" className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                  <span>{formatSeconds(bookmark.second)}</span>
                  {isNearby ? <span className="text-xs text-amber-500">Dang o gan moc nay</span> : null}
                </span>
                {bookmark.note ? <span className="mt-1 block text-sm text-muted-foreground">{bookmark.note}</span> : null}
              </span>
            </button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Xoa moc ${formatSeconds(bookmark.second)}`}
              disabled={deletingBookmarkId === bookmark.id}
              onClick={() => onDelete(bookmark.id)}
            >
              <Trash2 aria-hidden="true" className="size-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
