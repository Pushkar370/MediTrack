export default function Input({ label, error, className = "", id, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="label-base">
          {label}
        </label>
      )}
      <input id={id} className={"input-base " + (error ? "border-danger focus:ring-danger/20" : "") + " " + className} {...props} />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
