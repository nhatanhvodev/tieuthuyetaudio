import Link from "next/link";

type Props = {
  page: number;
  pageCount: number;
  basePath: string;
  params?: Record<string, string | undefined>;
};

export function PaginationControls({ page, pageCount, basePath, params = {} }: Props) {
  if (pageCount <= 1) return null;

  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(pageCount, page + 1);
  const currentParams = params;

  const buildHref = (targetPage: number) => {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(currentParams)) {
      if (value) searchParams.set(key, value);
    }
    searchParams.set("page", String(targetPage));
    return `${basePath}?${searchParams.toString()}`;
  };

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <Link
        href={buildHref(prevPage)}
        aria-disabled={page <= 1}
        className={`btn btn-sm ${page <= 1 ? "btn-disabled pointer-events-none" : "btn-outline border-slate-300 text-slate-700 hover:bg-slate-100"}`}
      >
        Trang trước
      </Link>
      <p className="text-sm text-slate-600">Trang {page} / {pageCount}</p>
      <Link
        href={buildHref(nextPage)}
        aria-disabled={page >= pageCount}
        className={`btn btn-sm ${page >= pageCount ? "btn-disabled pointer-events-none" : "btn-outline border-slate-300 text-slate-700 hover:bg-slate-100"}`}
      >
        Trang sau
      </Link>
    </div>
  );
}
