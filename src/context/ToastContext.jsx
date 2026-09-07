import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message, type = "success") => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => remove(id), 3500);
    },
    [remove]
  );

  const value = {
    toasts,
    showToast: show,
    success: (m) => show(m, "success"),
    error: (m) => show(m, "error"),
    info: (m) => show(m, "info"),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[min(92vw,22rem)]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              "flex items-center gap-3 rounded-xl px-4 py-3 shadow-card-hover text-sm font-medium text-white animate-[slideIn_0.2s_ease] " +
              (t.type === "error"
                ? "bg-danger"
                : t.type === "info"
                ? "bg-primary"
                : "bg-success")
            }
          >
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => remove(t.id)}
              className="text-white/80 hover:text-white"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
