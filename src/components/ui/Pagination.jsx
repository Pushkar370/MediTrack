import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="h-8 w-8 flex items-center justify-center rounded-lg border border-sage/40 text-ink/70 hover:bg-sage/20 disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={
            "h-8 min-w-8 px-2 rounded-lg text-sm font-medium border " +
            (p === page
              ? "bg-primary text-white border-primary"
              : "border-sage/40 text-ink/70 hover:bg-sage/20")
          }
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="h-8 w-8 flex items-center justify-center rounded-lg border border-sage/40 text-ink/70 hover:bg-sage/20 disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
