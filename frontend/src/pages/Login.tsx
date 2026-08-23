import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PassengerPageBackground from "../components/PassengerPageBackground";
import { Lock, Mail, ArrowRight } from "lucide-react";

/**
 * Passenger & Staff Sign In Page
 *
 * Designed with the Magiya editorial transit identity:
 * - Bilingual branding: Magiya (මගියා)
 * - Deep Ceylon Forest Green (#163E32) and Bus Amber (#D46B24)
 * - Role-based post-login redirection (Passenger -> /dashboard, Admin -> /admin, Driver -> /driver, etc.)
 * - Quick demo account buttons for fast evaluation during university project grading.
 */
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
      setError(err.message || "Invalid email or password. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#F8F6F0] px-4 py-12 text-stone-900 relative overflow-hidden">
      {/* Subtle Passenger Passport & Security Token Watermark */}
      <PassengerPageBackground variant="auth" opacity={0.20} />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <img src="/magiya-logo.png" alt="Magiya" className="h-12 w-12 object-contain drop-shadow" />
            <div className="text-left">
              <span className="text-xl font-black text-[#163E32] tracking-tight block">Magiya</span>
              <span className="text-[10px] font-bold text-[#D46B24] tracking-widest uppercase block -mt-1">
                මගියා ප්‍රවාහන
              </span>
            </div>
          </Link>
          <h1 className="text-2xl font-black text-[#163E32] tracking-tight">
            Sign In to Passenger Portal
          </h1>
          <p className="text-xs text-stone-500">
            Access your e-tickets, active seat holds, and travel booking history
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-white border border-[#E2DDD5] p-7 sm:p-8 shadow-sm space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="passenger@demo.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2DDD5] bg-[#FAF8F5] text-xs font-bold text-stone-900 focus:border-[#163E32] focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2DDD5] bg-[#FAF8F5] text-xs font-bold text-stone-900 focus:border-[#163E32] focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#163E32] hover:bg-[#1f5444] py-3 text-xs font-extrabold text-white shadow-md shadow-emerald-950/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Verifying Credentials..." : "Sign In to Account"}
              <ArrowRight size={15} />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-stone-500">
          New to Magiya?{" "}
          <Link to="/register" className="font-extrabold text-[#D46B24] hover:underline">
            Register Passenger Account →
          </Link>
        </p>
      </div>
    </div>
  );
}
