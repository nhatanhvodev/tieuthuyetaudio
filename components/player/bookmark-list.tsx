"use client";

import { useEffect, useState } from "react";
import { Check, Clock3, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatSeconds } from "@/lib/format";
import type { BookmarkTimelineItem } from "@/lib/bookmarks/validators";

type BookmarkListProps = {
  bookmarks: BookmarkTimelineItem[];
  currentSeconds: number;
  deletingBookmarkId: string | null;
  savingBookmarkId: string | null;
  onDelete: (bookmarkId: string) => void;
  onJump: (second: number) => void;
  onUpdate: (bookmarkId: string, note: string) => void;
};

export function BookmarkList({
  bookmarks,
  currentSeconds,
  deletingBookmarkId,
  savingBookmarkId,
  onDelete,
  onJump,
  onUpdate
}: BookmarkListProps) {
  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState("");

  useEffect(() => {
    if (editingBookmarkId && !bookmarks.some((bookmark) => bookmark.id === editingBookmarkId)) {
      setEditingBookmarkId(null);
      setEditingNote("");
    }
  }, [bookmarks, editingBookmarkId]);

  if (!bookmarks.length) {
    return <p className="mt-3 text-sm text-muted-foreground">Chua co moc nghe nao cho tap nay.</p>;
  }

  return (
    <div className="mt-4 space-y-2">
      {bookmarks.map((bookmark) => {
        const isNearby = Math.abs(currentSeconds - bookmark.second) <= 5;
        const isEditing = editingBookmarkId === bookmark.id;
        const isSaving = savingBookmarkId === bookmark.id;

        function startEdit() {
          setEditingBookmarkId(bookmark.id);
          setEditingNote(bookmark.note ?? "");
        }

        function cancelEdit() {
          setEditingBookmarkId(null);
          setEditingNote("");
        }

        function saveEdit() {
          onUpdate(bookmark.id, editingNote);
          setEditingBookmarkId(null);
        }

        return (
          <div
            key={bookmark.id}
            className="flex items-start justify-between gap-3 rounded-md border bg-background/60 p-3"
          >
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <span className="mt-0.5 rounded-full bg-secondary p-2 text-secondary-foreground">
                <Clock3 aria-hidden="true" className="size-4" />
              </span>
              <span className="min-w-0">
                <button
                  type="button"
                  onClick={() => onJump(bookmark.second)}
                  className="text-left"
                >
                  <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    <span>{formatSeconds(bookmark.second)}</span>
                    {isNearby ? <span className="text-xs text-amber-500">Dang o gan moc nay</span> : null}
                  </span>
                </button>
                {isEditing ? (
                  <span className="mt-2 block">
                    <Textarea
                      value={editingNote}
                      onChange={(event) => setEditingNote(event.target.value)}
                      maxLength={500}
                      className="min-h-20"
                    />
                  </span>
                ) : bookmark.note ? (
                  <span className="mt-1 block text-sm text-muted-foreground">{bookmark.note}</span>
                ) : (
                  <span className="mt-1 block text-sm text-muted-foreground">Chua co ghi chu.</span>
                )}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {isEditing ? (
                <>
                  <Button type="button" variant="ghost" size="icon" aria-label="Luu ghi chu" disabled={isSaving} onClick={saveEdit}>
                    <Check aria-hidden="true" className="size-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" aria-label="Huy sua ghi chu" disabled={isSaving} onClick={cancelEdit}>
                    <X aria-hidden="true" className="size-4" />
                  </Button>
                </>
              ) : (
                <Button type="button" variant="ghost" size="icon" aria-label={`Sua ghi chu moc ${formatSeconds(bookmark.second)}`} onClick={startEdit}>
                  <Pencil aria-hidden="true" className="size-4" />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Xoa moc ${formatSeconds(bookmark.second)}`}
                disabled={deletingBookmarkId === bookmark.id || isSaving}
                onClick={() => onDelete(bookmark.id)}
              >
                <Trash2 aria-hidden="true" className="size-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
