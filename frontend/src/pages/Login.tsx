import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const authUser = await login(email, password);
      if (authUser.role === "ADMIN") navigate("/admin");
      else if (authUser.role === "SUPPORT_STAFF") navigate("/support");
      else if (authUser.role === "FINANCE_OFFICER") navigate("/finance");
      else if (authUser.role === "DRIVER") navigate("/driver");
      else navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sign in to BusGo</h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter your credentials to access your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none"
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md shadow-slate-900/10"
        >
          {loading ? "Signing in..." : "Sign in to Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        No account yet?{" "}
        <Link to="/register" className="font-bold text-amber-600 hover:text-amber-700 underline">
          Create passenger account
        </Link>
      </p>
    </div>
  );
}
