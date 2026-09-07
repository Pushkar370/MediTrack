import { Search } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder = "Search...", className = "" }) {
  return (
    <div className={"relative " + className}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-base pl-9"
      />
    </div>
  );
}
