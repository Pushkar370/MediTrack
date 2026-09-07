import { Loader2 } from "lucide-react";

export default function LoadingState({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-ink/50">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-3 text-sm">{message}</p>
    </div>
  );
}
