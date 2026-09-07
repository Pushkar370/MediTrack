export default function Select({ label, error, className = "", id, children, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="label-base">
          {label}
        </label>
      )}
      <select
        id={id}
        className={"input-base appearance-none bg-white " + (error ? "border-danger" : "") + " " + className}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
