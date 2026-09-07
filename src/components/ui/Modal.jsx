import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, footer, size = "md" }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  if (!open) return null;

  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className={
          "relative bg-white rounded-t-2xl sm:rounded-2xl shadow-card-hover w-full " +
          widths[size] +
          " max-h-[92vh] flex flex-col animate-[slideUp_0.2s_ease]"
        }
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-sage/30">
          <h3 className="text-base font-semibold text-ink">{title}</h3>
          <button onClick={onClose} className="text-ink/50 hover:text-ink p-1" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-sage/30 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
