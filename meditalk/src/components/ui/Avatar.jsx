import { initials } from "../../constants";

export default function Avatar({ name = "", size = "md", className = "" }) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };
  return (
    <div
      className={
        "rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center shrink-0 " +
        sizes[size] +
        " " +
        className
      }
    >
      {initials(name)}
    </div>
  );
}
