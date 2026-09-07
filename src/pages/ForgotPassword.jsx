import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import Logo from "../components/ui/Logo";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useToast } from "../context/ToastContext";

export default function ForgotPassword() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setSent(true);
    toast.info("If this email exists, a reset link was sent.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6"><Logo /></div>
        <div className="card">
          <h1 className="text-xl font-bold text-ink">Forgot password</h1>
          <p className="text-sm text-ink/50 mt-1">
            Enter your email and we'll send a reset link.
          </p>

          {sent ? (
            <div className="mt-6 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-success/15 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <p className="mt-3 text-sm text-ink/70">Reset link sent to {email}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
                <Input
                  className="pl-9"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  error={error}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">Send reset link</Button>
            </form>
          )}

          <Link to="/login" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
