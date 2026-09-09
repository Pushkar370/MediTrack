import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, CheckCircle2 } from "lucide-react";
import Logo from "../components/ui/Logo";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import { useToast } from "../context/ToastContext";
import { register as registerService } from "../services/authService";
import { GENDERS } from "../constants";

export default function Register() {
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", phone: "", dob: "", gender: "", password: "", confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.phone.trim()) e.phone = "Phone is required.";
    if (!form.dob) e.dob = "Date of birth is required.";
    if (!form.gender) e.gender = "Please select gender.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 6) e.password = "Password must be at least 6 characters.";
    if (form.confirm !== form.password) e.confirm = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const res = await registerService(form);
    setSubmitting(false);
    if (res.success) {
      setDone(true);
      toast.success("Registration successful!");
    } else {
      toast.error(res.message);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="card max-w-md text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-success/15 flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7 text-success" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-ink">Account created</h1>
          <p className="mt-2 text-sm text-ink/60">
            Your MediTrack account is ready. You can now sign in.
          </p>
          <Button className="mt-6 w-full" onClick={() => navigate("/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <div className="card">
          <h1 className="text-2xl font-bold text-ink">Create your account</h1>
          <p className="text-sm text-ink/50 mt-1">Join MediTrack as a patient.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Full name" value={form.name} error={errors.name} onChange={(e) => update("name", e.target.value)} />
              <Input label="Email" type="email" value={form.email} error={errors.email} onChange={(e) => update("email", e.target.value)} />
              <Input label="Phone" value={form.phone} error={errors.phone} onChange={(e) => update("phone", e.target.value)} />
              <Input label="Date of birth" type="date" value={form.dob} error={errors.dob} onChange={(e) => update("dob", e.target.value)} />
              <Select label="Gender" value={form.gender} error={errors.gender} onChange={(e) => update("gender", e.target.value)}>
                <option value="">Select</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </Select>
              <div />
              <Input label="Password" type="password" value={form.password} error={errors.password} onChange={(e) => update("password", e.target.value)} />
              <Input label="Confirm password" type="password" value={form.confirm} error={errors.confirm} onChange={(e) => update("confirm", e.target.value)} />
            </div>

            <Button type="submit" loading={submitting} className="w-full" size="lg">
              <UserPlus className="h-4 w-4" /> Create Account
            </Button>
          </form>

          <p className="mt-4 text-sm text-ink/60 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
