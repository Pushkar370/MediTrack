import { Link } from "react-router-dom";
import { FileQuestion } from "lucide-react";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card max-w-md text-center">
        <div className="mx-auto h-14 w-14 rounded-full bg-sage/20 flex items-center justify-center">
          <FileQuestion className="h-7 w-7 text-primary" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-ink">404</h1>
        <p className="mt-1 text-sm text-ink/60">The page you're looking for doesn't exist.</p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
