export default function Card({ children, className = "", title, action, padded = true }) {
  return (
    <div className={"card " + className}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="font-semibold text-ink">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
