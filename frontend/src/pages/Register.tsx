import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PassengerPageBackground from "../components/PassengerPageBackground";
import { User, Mail, Phone, Lock, ArrowRight, ShieldCheck } from "lucide-react";

/**
 * Passenger Registration Page
 *
 * Implements a clean Sri Lankan transit passenger onboarding flow:
 * - Full name, email, local mobile phone (07X XXX XXXX), and secure password.
 * - Warm Ivory (#F8F6F0) and Ceylon Forest Green (#163E32) design tokens.
 * - Instant redirection to bus search after passenger account creation.
 */
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(name, email, phone, password);
      navigate("/search");
    } catch (err: any) {
      setError(err.message || "Registration could not be completed. Please try again.");
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
            Create Passenger Account
          </h1>
          <p className="text-xs text-stone-500">
            Book express highway bus tickets, hold seats, and receive instant QR passes
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-white border border-[#E2DDD5] p-7 sm:p-8 shadow-sm space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kasun Silva"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2DDD5] bg-[#FAF8F5] text-xs font-bold text-stone-900 focus:border-[#163E32] focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </div>

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
                  placeholder="passenger@example.lk"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2DDD5] bg-[#FAF8F5] text-xs font-bold text-stone-900 focus:border-[#163E32] focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-700 mb-1.5">
                Sri Lankan Mobile Number
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="077 123 4567"
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
                  placeholder="Minimum 8 characters"
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
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#163E32] hover:bg-[#1f5444] py-3 text-xs font-extrabold text-white shadow-md shadow-emerald-950/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "Creating Passenger Profile..." : "Register & Start Booking"}
              <ArrowRight size={15} />
            </button>
          </form>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
            <ShieldCheck size={13} className="text-[#163E32]" />
            <span>Regulated under National Transport Commission (NTC) standards</span>
          </div>
        </div>

        <p className="text-center text-xs text-stone-500">
          Already registered?{" "}
          <Link to="/login" className="font-extrabold text-[#D46B24] hover:underline">
            Sign In Here →
          </Link>
        </p>
      </div>
    </div>
  );
}
