import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary:
    "bg-primary text-white hover:bg-primary-dark focus:ring-primary/30 shadow-sm",
  secondary:
    "bg-sage/20 text-primary hover:bg-sage/40 focus:ring-sage/40 border border-sage/50",
  accent: "bg-accent text-ink hover:bg-accent-light focus:ring-accent/40",
  danger: "bg-danger text-white hover:bg-red-600 focus:ring-danger/30",
  outline:
    "bg-white text-ink border border-sage/50 hover:bg-background focus:ring-sage/40",
  ghost: "bg-transparent text-ink hover:bg-sage/20 focus:ring-sage/30",
  success: "bg-success text-white hover:bg-green-700 focus:ring-success/30",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  disabled,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition " +
        "focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed " +
        VARIANTS[variant] +
        " " +
        SIZES[size] +
        " " +
        className
      }
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
