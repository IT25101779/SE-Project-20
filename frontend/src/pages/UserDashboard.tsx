import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserApi, BookingApi, type UserProfileDto } from "../api/client";
import { useAuth } from "../context/AuthContext";
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
      .catch((err) => setError(err.message))
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
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await BookingApi.cancel(id);
      toast.success("Booking cancelled successfully.");
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
      toast.success("Profile updated successfully!");
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
      toast.success("Password changed successfully!");
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
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Header Profile Card */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-2xl font-bold text-slate-900 shadow-lg shadow-amber-500/20">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile?.name}</h1>
              <p className="text-sm text-slate-400 flex items-center gap-2 mt-0.5">
                <Mail size={14} /> {profile?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 px-3 py-1 text-xs font-semibold text-amber-400">
              <Shield size={12} /> {profile?.role?.replace("_", " ")}
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-400/10 border border-emerald-400/30 px-3 py-1 text-xs font-semibold text-emerald-400">
              Active
            </span>
          </div>
        </div>

        {/* Quick metrics */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-white/10 pt-5">
          <button
            onClick={() => setActiveTab("bookings")}
            className="flex items-center gap-3 rounded-xl bg-white/5 p-3 hover:bg-white/10 transition-colors text-left"
          >
            <Ticket size={20} className="text-amber-400" />
            <div>
              <p className="text-xs text-slate-400">Total Bookings</p>
              <p className="text-lg font-bold text-white">{bookings.length || profile?.totalBookings || 0}</p>
            </div>
          </button>
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <Phone size={20} className="text-emerald-400" />
            <div>
              <p className="text-xs text-slate-400">Phone</p>
              <p className="text-sm font-medium text-white truncate max-w-[130px]">
                {profile?.phone || "Not set"}
              </p>
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1 flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <Calendar size={20} className="text-blue-400" />
            <div>
              <p className="text-xs text-slate-400">Member Since</p>
              <p className="text-sm font-medium text-white">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "Active"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("bookings")}
          className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "bookings"
              ? "border-amber-500 text-amber-600 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Ticket size={16} /> My Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "profile"
              ? "border-amber-500 text-amber-600 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <User size={16} /> Edit Profile
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "password"
              ? "border-amber-500 text-amber-600 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <KeyRound size={16} /> Change Password
        </button>
        <button
          onClick={() => setActiveTab("danger")}
          className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "danger"
              ? "border-red-500 text-red-600 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <AlertOctagon size={16} /> Account Actions
        </button>
      </div>

      {/* Tab Contents */}
      <div className="mt-6">
        {/* TAB 1: BOOKINGS */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Your Reserved Trips</h2>
                <p className="text-xs text-slate-500">View upcoming and previous journey bookings.</p>
              </div>
              <Link
                to="/search"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-2 text-xs font-bold text-slate-900 shadow-sm hover:from-amber-400 hover:to-amber-300 transition-all"
              >
                Book a Bus <ArrowRight size={14} />
              </Link>
            </div>

            {loadingBookings ? (
              <p className="py-8 text-center text-sm text-slate-400">Loading your bookings...</p>
            ) : bookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <Ticket size={36} className="mx-auto text-slate-300 mb-3" />
                <p className="font-semibold text-slate-700">No bookings yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Search across top routes in Sri Lanka to book your first trip!
                </p>
                <Link
                  to="/search"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                >
                  Search Buses
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between bg-slate-900 px-4 py-2.5 text-white">
                      <div className="flex items-center gap-2">
                        <Ticket size={16} className="text-amber-400" />
                        <span className="font-mono text-xs font-bold">{b.ticketReference}</span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          b.status === "CONFIRMED"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : b.status === "CANCELLED"
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {b.status === "CONFIRMED" && <CheckCircle2 size={10} />}
                        {b.status === "CANCELLED" && <XCircle size={10} />}
                        {b.status === "PENDING" && <Clock size={10} />}
                        {b.status}
                      </span>
                    </div>

                    <div className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-base font-bold text-slate-900">
                            {b.schedule?.route?.name || "Bus Route"}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin size={13} className="text-amber-500" />
                            {b.pickupStop?.name} → {b.dropStop?.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <div>
                            <p className="text-slate-400">Travel Date</p>
                            <p className="font-semibold text-slate-800">{b.travelDate}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Seat</p>
                            <p className="font-semibold text-slate-800">Seat {b.seat?.seatNumber}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                        <Link
                          to="/my-bookings"
                          className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                        >
                          View E-Ticket & Tracking
                        </Link>
                        {b.status === "CONFIRMED" && (
                          <button
                            onClick={() => handleCancelBooking(b.id)}
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
                          >
                            Cancel Ticket
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

        {/* TAB 2: PROFILE */}
        {activeTab === "profile" && (
          <form
            onSubmit={handleUpdateProfile}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
          >
            <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
            <p className="text-xs text-slate-500">Update your name, contact phone number, and preferences.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">Email Address (Read-only)</label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || ""}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0771234567"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">Preferred Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none"
                >
                  <option value="en">English (en)</option>
                  <option value="si">Sinhala (si)</option>
                  <option value="ta">Tamil (ta)</option>
                </select>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={savingProfile}
              className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors shadow-md disabled:opacity-50"
            >
              {savingProfile ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}

        {/* TAB 3: PASSWORD */}
        {activeTab === "password" && (
          <form
            onSubmit={handleChangePassword}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 max-w-md"
          >
            <h2 className="text-lg font-bold text-slate-900">Change Password</h2>
            <p className="text-xs text-slate-500">Ensure your account uses a strong password.</p>

            <div>
              <label className="block text-xs font-medium text-slate-700">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}

            <button
              type="submit"
              disabled={changingPassword}
              className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors shadow-md disabled:opacity-50"
            >
              {changingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        {/* TAB 4: DANGER ZONE */}
        {activeTab === "danger" && (
          <div className="rounded-2xl border border-red-200 bg-red-50/40 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-red-900 flex items-center gap-2">
              <AlertOctagon size={20} className="text-red-600" /> Deactivate Account
            </h2>
            <p className="text-sm text-slate-600 max-w-xl">
              Deactivating your account will disable your login and cancel any pending reservations.
              In accordance with project specifications, user accounts can be deactivated at any time.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleDeactivate}
                className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors shadow-md shadow-red-600/20"
              >
                Deactivate My Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
