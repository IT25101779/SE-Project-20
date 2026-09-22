import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bus, Menu, X, LogOut, Bell, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { NotificationApi, type NotificationEntry } from "../api/client";

import toast from "react-hot-toast";

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationEntry[]>([]);
  const bellRef = useRef<HTMLDivElement>(null);
  const seenIdsRef = useRef<Set<number>>(new Set());
  const isFirstLoadRef = useRef(true);

  const links: { to: string; label: string; show: boolean }[] = [
    { to: "/search", label: "Find Buses", show: true },
    { to: "/my-bookings", label: "My Bookings", show: !!user },
    { to: "/dashboard", label: "Dashboard", show: !!user },
    { to: "/admin", label: "Admin", show: user?.role === "ADMIN" },
    { to: "/finance", label: "Finance", show: user?.role === "FINANCE_OFFICER" },
    { to: "/support", label: "Support", show: user?.role === "SUPPORT_STAFF" },
    { to: "/driver", label: "Today's Trips", show: user?.role === "DRIVER" },
  ];

  function fetchNotifications() {
    if (!user) return;
    NotificationApi.mine()
      .then((data) => {
        setNotifications(data);
        if (!isFirstLoadRef.current) {
          const newAlerts = data.filter((n) => !seenIdsRef.current.has(n.id));
          if (newAlerts.length > 0) {
            newAlerts.forEach((n) => {
              toast(
                () => (
                  <div className="flex flex-col gap-1 py-0.5">
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                      🔔 Website Travel Alert
                    </span>
                    <span className="text-xs text-slate-800 leading-relaxed">{n.message}</span>
                  </div>
                ),
                { duration: 7000 }
              );
            });
          }
        }
        data.forEach((n) => seenIdsRef.current.add(n.id));
        isFirstLoadRef.current = false;
      })
      .catch(() => {});
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 4000);
    return () => clearInterval(interval);
  }, [user]);

  // Click outside to close bell popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setBellOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleDismiss(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await NotificationApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {}
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative px-3.5 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
      isActive
        ? "text-amber-400 bg-amber-400/10 font-semibold"
        : "text-slate-300 hover:text-white hover:bg-white/5"
    }`;

  return (
    <header className="sticky top-0 z-40 glass-dark border-b border-white/5">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 shadow-lg shadow-amber-500/25 group-hover:shadow-amber-500/40 transition-shadow">
            <Bus size={19} strokeWidth={2.5} />
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            BusGo <span className="text-amber-400">Sri Lanka</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.filter((l) => l.show).map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Auth section */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              {/* Notification Bell Icon & Popover */}
              <div className="relative" ref={bellRef}>
                <button
                  type="button"
                  onClick={() => setBellOpen((v) => !v)}
                  className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  title="Notifications"
                >
                  <Bell size={16} />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-md animate-pulse">
                      {notifications.length > 9 ? "9+" : notifications.length}
                    </span>
                  )}
                </button>

                {/* Popover */}
                {bellOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-700/80 bg-slate-900/98 p-3 shadow-2xl backdrop-blur-xl animate-fade-slide-down z-50">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10 px-1">
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Bell size={13} className="text-amber-400" /> Notifications ({notifications.length})
                      </p>
                      <Link
                        to="/notifications"
                        onClick={() => setBellOpen(false)}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-medium"
                      >
                        View all
                      </Link>
                    </div>

                    <div className="mt-2 max-h-64 space-y-2 overflow-y-auto pr-1">
                      {notifications.length === 0 ? (
                        <p className="py-6 text-center text-xs text-slate-400">
                          No notifications yet.
                        </p>
                      ) : (
                        notifications.slice(0, 4).map((n) => (
                          <div
                            key={n.id}
                            className="group relative rounded-xl bg-white/5 p-2.5 text-xs hover:bg-white/10 transition-colors border border-white/5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="rounded-md bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                                {n.channel === "IN_APP" ? "Website Alert" : n.channel}
                              </span>
                              <button
                                onClick={(e) => handleDismiss(n.id, e)}
                                className="text-slate-500 hover:text-red-400 text-xs transition-colors"
                                title="Dismiss"
                              >
                                ×
                              </button>
                            </div>
                            <p className="mt-1.5 text-xs text-slate-200 line-clamp-2">
                              {n.message}
                            </p>
                            <p className="mt-1 text-[10px] text-slate-400">
                              {n.sentAt ? new Date(n.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now"}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    {notifications.length > 4 && (
                      <div className="mt-2 pt-2 border-t border-white/10 text-center">
                        <Link
                          to="/notifications"
                          onClick={() => setBellOpen(false)}
                          className="text-xs text-slate-300 hover:text-amber-400 font-medium flex items-center justify-center gap-1"
                        >
                          +{notifications.length - 4} more notifications <ChevronRight size={13} />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Profile Pill */}
              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 hover:bg-white/10 transition-colors"
                title="Account Dashboard & Settings"
              >
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-xs text-slate-900">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-slate-200">{user.name}</span>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs text-amber-400/80">{user.role.replace("_", " ")}</span>
              </Link>

              <button
                onClick={() => { logout(); navigate("/"); }}
                className="flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 rounded-lg hover:from-amber-400 hover:to-amber-300 transition-all shadow-lg shadow-amber-500/20"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          {user && (
            <Link
              to="/notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-200 hover:bg-white/10 transition-all"
              title="Notifications"
            >
              <Bell size={18} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {notifications.length}
                </span>
              )}
            </Link>
          )}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-200 hover:bg-white/10 transition-all"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/5 bg-slate-900/98 px-4 py-4 animate-fade-slide-down">
          <div className="flex flex-col gap-1">
            {links.filter((l) => l.show).map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
            {user ? (
              <button
                onClick={() => { logout(); setOpen(false); navigate("/"); }}
                className="mt-3 flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2.5 text-sm text-slate-300 hover:text-white"
              >
                <LogOut size={14} /> Logout ({user.name})
              </button>
            ) : (
              <div className="mt-3 flex gap-2">
                <Link to="/login" onClick={() => setOpen(false)} className="flex-1 rounded-lg bg-white/5 px-3 py-2.5 text-center text-sm text-slate-300">
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="flex-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 px-3 py-2.5 text-center text-sm font-bold text-slate-900">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
