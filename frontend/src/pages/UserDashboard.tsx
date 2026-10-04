import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserApi, BookingApi, type UserProfileDto } from "../api/client";
import { useAuth } from "../context/AuthContext";
import PassengerPageBackground from "../components/PassengerPageBackground";
import {
  User,
  KeyRound,
  AlertOctagon,
  Ticket,
  Shield,
  Calendar,
  Phone,
  Mail,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";

interface BookingRow {
  id: number;
  status: string;
  ticketReference: string;
  travelDate: string;
  seat: { seatNumber: string };
  pickupStop: { name: string };
  dropStop: { name: string };
  schedule: { id: number; route: { id: number; name: string } };
}

/**
 * Passenger Account & Trip Dashboard
 *
 * Implements an editorial Sri Lankan transit portal:
 * - Header banner in Deep Ceylon Forest Green (#163E32) with passenger credential metrics.
 * - Tabbed navigation: Reserved Trips, Personal Details, Security, and Account Deactivation.
 * - Trips displayed as authentic perforated transit boarding passes.
 * - Direct links to live GPS tracking and seat management.
 */
export default function UserDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bookings state
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Edit profile state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState("en");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<"bookings" | "profile" | "password" | "danger">("bookings");

  function loadProfile() {
    setLoading(true);
    UserApi.getProfile()
      .then((data) => {
        setProfile(data);
        setName(data.name);
        setPhone(data.phone || "");
        setLanguage(data.preferredLanguage || "en");
      })
      .catch((err) => setError(err.message || "Failed to load passenger profile."))
      .finally(() => setLoading(false));
  }

  function loadBookings() {
    setLoadingBookings(true);
    BookingApi.mine()
      .then((data) => setBookings(data as BookingRow[]))
      .catch(() => {})
      .finally(() => setLoadingBookings(false));
  }

  useEffect(() => {
    loadProfile();
    loadBookings();
  }, []);

  async function handleCancelBooking(id: number) {
    if (!window.confirm("Are you sure you want to cancel this ticket reservation?")) return;
    try {
      await BookingApi.cancel(id);
      toast.success("Ticket reservation cancelled successfully.");
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b))
      );
      if (profile) {
        setProfile({ ...profile, totalBookings: Math.max(0, profile.totalBookings - 1) });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel booking");
    }
  }

  async function handleUpdateProfile(e: FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setError(null);
    try {
      const updated = await UserApi.updateProfile({
        name,
        phone,
        preferredLanguage: language,
      });
      setProfile(updated);
      toast.success("Passenger profile updated successfully!");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    setChangingPassword(true);
    try {
      await UserApi.changePassword({ currentPassword, newPassword });
      toast.success("Security password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.message || "Failed to change password");
      toast.error(err.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleDeactivate() {
    const confirmation = window.prompt(
      'Are you sure you want to deactivate your account?\nType "DEACTIVATE" to confirm:'
    );
    if (confirmation !== "DEACTIVATE") {
      if (confirmation !== null) {
        toast.error("Confirmation text did not match.");
      }
      return;
    }

    try {
      await UserApi.deactivateAccount();
      toast.success("Your account has been deactivated.");
      logout();
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Failed to deactivate account");
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F8F6F0] text-stone-500 text-xs font-bold">
        Loading passenger portal...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] py-10 text-stone-900 relative overflow-hidden">
      {/* Subtle Passenger Mileage & Profile Dashboard Watermark */}
      <PassengerPageBackground variant="dashboard" opacity={0.20} />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-6 relative z-10">
        {/* Header Profile Identity Card */}
        <div className="rounded-2xl bg-[#163E32] p-6 sm:p-7 text-white shadow-xl shadow-emerald-950/20 border border-[#235547] relative overflow-hidden">
          {/* Subtle Sri Lankan pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D46B24] text-2xl font-black text-white shadow-md">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <div className="inline-flex items-center gap-2 text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                  <span>මගියා ගිණුම</span>
                  <span>•</span>
                  <span>Verified Passenger</span>
                </div>
                <h1 className="text-2xl font-extrabold text-white">{profile?.name}</h1>
                <p className="text-xs text-emerald-100/75 flex items-center gap-1.5 mt-0.5">
                  <Mail size={13} className="text-amber-300" /> {profile?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-900/80 border border-emerald-700/60 px-3 py-1 text-xs font-bold text-emerald-200">
                <Shield size={12} className="text-amber-400" /> {profile?.role?.replace("_", " ")}
              </span>
              <span className="inline-flex items-center rounded-full bg-amber-400/20 border border-amber-400/40 px-3 py-1 text-xs font-bold text-amber-300">
                Active Member
              </span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="relative z-10 mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-white/10 pt-5">
            <button
              onClick={() => setActiveTab("bookings")}
              className="flex items-center gap-3 rounded-xl bg-white/5 p-3 hover:bg-white/10 transition-colors text-left border border-white/5"
            >
              <Ticket size={20} className="text-amber-300 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/70">Total Journeys</p>
                <p className="text-lg font-black text-white">{bookings.length || profile?.totalBookings || 0}</p>
              </div>
            </button>

            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3 border border-white/5">
              <Phone size={20} className="text-emerald-300 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/70">Phone Contact</p>
                <p className="text-xs font-bold text-white truncate max-w-[130px]">
                  {profile?.phone || "Not configured"}
                </p>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 flex items-center gap-3 rounded-xl bg-white/5 p-3 border border-white/5">
              <Calendar size={20} className="text-amber-300 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/70">Member Since</p>
                <p className="text-xs font-bold text-white">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "Active Passenger"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-2 border-b border-[#E2DDD5] pb-px">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-extrabold transition-colors ${
              activeTab === "bookings"
                ? "border-[#163E32] text-[#163E32]"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <Ticket size={15} /> My Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-extrabold transition-colors ${
              activeTab === "profile"
                ? "border-[#163E32] text-[#163E32]"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <User size={15} /> Edit Profile
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-extrabold transition-colors ${
              activeTab === "password"
                ? "border-[#163E32] text-[#163E32]"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <KeyRound size={15} /> Change Password
          </button>
          <button
            onClick={() => setActiveTab("danger")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-extrabold transition-colors ${
              activeTab === "danger"
                ? "border-rose-600 text-rose-700"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <AlertOctagon size={15} /> Account Actions
          </button>
        </div>

        {/* Tab Contents */}
        <div className="pt-2">
          {/* TAB 1: RESERVED TRIPS (TRAVEL TICKETS) */}
          {activeTab === "bookings" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-[#163E32]">Reserved Bus Journeys</h2>
                  <p className="text-xs text-stone-500">Upcoming express services & past trip history.</p>
                </div>
                <Link
                  to="/search"
                  className="flex items-center gap-1.5 rounded-xl bg-[#D46B24] hover:bg-[#b85b1c] px-4 py-2 text-xs font-extrabold text-white shadow-sm transition-all"
                >
                  Book New Bus <ArrowRight size={13} />
                </Link>
              </div>

              {loadingBookings ? (
                <p className="py-12 text-center text-xs text-stone-500 font-bold">Loading passenger tickets...</p>
              ) : bookings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#E2DDD5] bg-white p-10 text-center">
                  <Ticket size={36} className="mx-auto text-stone-300 mb-3" />
                  <p className="font-extrabold text-stone-800 text-sm">No ticket bookings yet</p>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                    Search across top routes in Sri Lanka to book your first expressway or intercity journey!
                  </p>
                  <Link
                    to="/search"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#163E32] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#1f5444] transition-colors"
                  >
                    Search Buses Now →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className="overflow-hidden rounded-2xl border border-[#E2DDD5] bg-white shadow-sm hover:border-[#D46B24] transition-colors"
                    >
                      {/* Ticket Perforation Header */}
                      <div className="flex items-center justify-between bg-[#163E32] px-4 py-2.5 text-white">
                        <div className="flex items-center gap-2">
                          <Ticket size={15} className="text-amber-300" />
                          <span className="font-mono text-xs font-extrabold text-amber-200">
                            {b.ticketReference || `REF-${b.id}`}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                            b.status === "CONFIRMED"
                              ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30"
                              : b.status === "CANCELLED"
                              ? "bg-rose-500/20 text-rose-200 border border-rose-500/30"
                              : "bg-amber-500/20 text-amber-200 border border-amber-500/30"
                          }`}
                        >
                          {b.status === "CONFIRMED" && <CheckCircle2 size={11} />}
                          {b.status === "CANCELLED" && <XCircle size={11} />}
                          {b.status === "PENDING" && <Clock size={11} />}
                          {b.status}
                        </span>
                      </div>

                      {/* Ticket Body */}
                      <div className="p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <p className="text-base font-extrabold text-stone-900">
                              {b.schedule?.route?.name || "Intercity Express Line"}
                            </p>
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-600 font-medium">
                              <MapPin size={13} className="text-[#D46B24]" />
                              {b.pickupStop?.name} → {b.dropStop?.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-5 text-xs">
                            <div>
                              <p className="text-[10px] font-extrabold uppercase text-stone-400">Travel Date</p>
                              <p className="font-bold text-stone-800">{b.travelDate}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-extrabold uppercase text-stone-400">Reserved Seat</p>
                              <p className="font-black text-[#163E32]">Seat {b.seat?.seatNumber}</p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex items-center justify-end gap-2 border-t border-stone-100 pt-3">
                          <Link
                            to="/my-bookings"
                            className="rounded-xl bg-[#FAF8F5] border border-[#E2DDD5] px-3.5 py-1.5 text-xs font-extrabold text-[#163E32] hover:bg-emerald-50 transition-colors"
                          >
                            View Boarding Pass & Live GPS →
                          </Link>
                          {b.status === "CONFIRMED" && (
                            <button
                              onClick={() => handleCancelBooking(b.id)}
                              className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-1.5 text-xs font-extrabold text-rose-700 hover:bg-rose-100 transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EDIT PROFILE */}
          {activeTab === "profile" && (
            <form
              onSubmit={handleUpdateProfile}
              className="rounded-2xl border border-[#E2DDD5] bg-white p-6 sm:p-7 shadow-sm space-y-4"
            >
              <h2 className="text-base font-extrabold text-[#163E32]">Personal Information</h2>
              <p className="text-xs text-stone-500">Update your name, contact phone number, and system language preferences.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-[#E2DDD5] bg-[#FAF8F5] px-3.5 py-2.5 text-xs font-bold text-stone-900 focus:border-[#163E32] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-700 mb-1">Email Address (Read-only)</label>
                  <input
                    type="email"
                    disabled
                    value={profile?.email || ""}
                    className="w-full rounded-xl border border-[#E2DDD5] bg-stone-100 px-3.5 py-2.5 text-xs font-bold text-stone-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-700 mb-1">Sri Lankan Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0771234567"
                    className="w-full rounded-xl border border-[#E2DDD5] bg-[#FAF8F5] px-3.5 py-2.5 text-xs font-bold text-stone-900 focus:border-[#163E32] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-700 mb-1">Preferred Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-xl border border-[#E2DDD5] bg-[#FAF8F5] px-3.5 py-2.5 text-xs font-bold text-stone-900 focus:border-[#163E32] focus:bg-white focus:outline-none"
                  >
                    <option value="en">English (Official Interface)</option>
                    <option value="si">සිංහල (Sinhala)</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                  </select>
                </div>
              </div>

              {error && <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl">{error}</p>}

              <button
                type="submit"
                disabled={savingProfile}
                className="rounded-xl bg-[#163E32] hover:bg-[#1f5444] px-6 py-2.5 text-xs font-extrabold text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {savingProfile ? "Saving Updates..." : "Save Passenger Profile"}
              </button>
            </form>
          )}

          {/* TAB 3: PASSWORD CHANGE */}
          {activeTab === "password" && (
            <form
              onSubmit={handleChangePassword}
              className="rounded-2xl border border-[#E2DDD5] bg-white p-6 sm:p-7 shadow-sm space-y-4 max-w-md"
            >
              <h2 className="text-base font-extrabold text-[#163E32]">Account Security & Password</h2>
              <p className="text-xs text-stone-500">Ensure your account uses a secure password to protect your seat bookings.</p>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#E2DDD5] bg-[#FAF8F5] px-3.5 py-2.5 text-xs font-bold text-stone-900 focus:border-[#163E32] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-[#E2DDD5] bg-[#FAF8F5] px-3.5 py-2.5 text-xs font-bold text-stone-900 focus:border-[#163E32] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full rounded-xl border border-[#E2DDD5] bg-[#FAF8F5] px-3.5 py-2.5 text-xs font-bold text-stone-900 focus:border-[#163E32] focus:bg-white focus:outline-none"
                />
              </div>

              {passwordError && <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl">{passwordError}</p>}

              <button
                type="submit"
                disabled={changingPassword}
                className="rounded-xl bg-[#163E32] hover:bg-[#1f5444] px-6 py-2.5 text-xs font-extrabold text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {changingPassword ? "Updating..." : "Update Security Password"}
              </button>
            </form>
          )}

          {/* TAB 4: ACCOUNT DEACTIVATION */}
          {activeTab === "danger" && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-6 sm:p-7 shadow-sm space-y-4">
              <h2 className="text-base font-extrabold text-rose-900 flex items-center gap-2">
                <AlertOctagon size={18} className="text-rose-600" /> Deactivate Passenger Account
              </h2>
              <p className="text-xs text-stone-600 max-w-xl leading-relaxed">
                Deactivating your account will suspend your login and cancel any unpaid seat holds.
                In accordance with National Transport Commission standards, ticket archives remain accessible for dispute resolution.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDeactivate}
                  className="rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-extrabold text-white hover:bg-rose-700 transition-colors shadow-sm"
                >
                  Deactivate My Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
