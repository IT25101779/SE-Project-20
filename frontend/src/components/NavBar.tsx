/**
 * NavBar Component
 * ----------------
 * Provides the global navigation header for the Magiya Bus Reservation System.
 * 
 * Features:
 * - Brand identity with official bilingual typography: Magiya (මගියා).
 * - Context-aware navigation links showing traveler actions (Search, My Tickets)
 *   and role-specific staff control portals (Fleet Admin, Finance, Trip Control).
 * - Real-time notification polling with toast popups for urgent schedule delays.
 * - Mobile-friendly responsive menu with accessible touch targets.
 */

import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut, Bell, Compass, Ticket, User, Shield, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { NotificationApi, type NotificationEntry } from "../api/client";
import toast from "react-hot-toast";

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();


  // State for mobile drawer and notification dropdown
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationEntry[]>([]);

  // Refs for click-outside detection and avoiding repeat toast alerts
  const bellRef = useRef<HTMLDivElement>(null);
  const seenNotificationIds = useRef<Set<number>>(new Set());
  const isInitialFetch = useRef(true);

  // Navigation link configuration with role-based visibility
  const navLinks = [
    { to: "/search", label: "Search Buses", icon: Compass, show: true },
    { to: "/my-bookings", label: "My Bookings", icon: Ticket, show: !!user },
    { to: "/dashboard", label: "Account", icon: User, show: !!user },
    { to: "/admin", label: "Fleet Admin", icon: Shield, show: user?.role === "ADMIN" },
    { to: "/finance", label: "Finance & Refunds", icon: Shield, show: user?.role === "FINANCE_OFFICER" },
    { to: "/support", label: "Support & Alerts", icon: Shield, show: user?.role === "SUPPORT_STAFF" },
    { to: "/driver", label: "Driver Manifest", icon: Shield, show: user?.role === "DRIVER" },
  ];

  /**
   * Periodically fetches user notifications from the backend API.
   * Compares received notification IDs against previously seen IDs
   * to trigger a high-priority toast when new travel delays or confirmations arrive.
   */
  function fetchUserNotifications() {
    if (!user) return;
    NotificationApi.mine()
      .then((data) => {
        setNotifications(data);
        if (!isInitialFetch.current) {
          const freshAlerts = data.filter((n) => !seenNotificationIds.current.has(n.id));
          freshAlerts.forEach((n) => {
            toast(
              () => (
                <div className="flex flex-col gap-1 py-1">
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                    Travel Advisory
                  </span>
                  <span className="text-xs text-stone-800 leading-snug">{n.message}</span>
                </div>
              ),
              { duration: 6000 }
            );
          });
        }
        data.forEach((n) => seenNotificationIds.current.add(n.id));
        isInitialFetch.current = false;
      })
      .catch(() => {
        // Silently handle polling failure during network blips
      });
  }

  // Set up 5-second polling interval when user is authenticated
  useEffect(() => {
    fetchUserNotifications();
    const timer = setInterval(fetchUserNotifications, 5000);
    return () => clearInterval(timer);
  }, [user]);

  // Close notification popover on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setNotificationDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dismiss a notification item
  async function handleDismissNotification(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await NotificationApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // Ignored
    }
  }

  // Active navigation link style
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
      isActive
        ? "bg-[#0D2B23] text-amber-300 font-bold border border-amber-300/30"
        : "text-stone-200 hover:text-white hover:bg-[#1C4E40]"
    }`;

  if (location.pathname === "/") {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-[#163E32] text-white border-b border-[#0F2E25] shadow-sm">
      {/* Top Transport Info Strip */}
      <div className="border-b border-[#1E4D3F] bg-[#113329] py-1 px-4 text-center text-[11px] text-stone-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
            <span>Sri Lanka Intercity Express Bus Reservation & Fleet System</span>
          </span>
          <span className="hidden sm:inline text-stone-300 text-[10px]">
            National Transport Commission (NTC) Route Network
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-md bg-white p-1 border border-stone-200 flex items-center justify-center shrink-0">
            <img src="/magiya-logo.png" alt="Magiya Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold tracking-tight text-white font-['Plus_Jakarta_Sans']">
                Magiya
              </span>
              <span className="text-xs font-bold text-amber-400">
                (මගියා)
              </span>
            </div>
            <p className="text-[9.5px] uppercase tracking-wider text-stone-300 -mt-0.5 font-medium">
              Lanka Transit Connect
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1.5 md:flex">
          {navLinks
            .filter((link) => link.show)
            .map((link) => {
              const Icon = link.icon;
              return (
                <NavLink key={link.to} to={link.to} className={getNavLinkClass}>
                  <Icon size={14} className="shrink-0 text-stone-300" />
                  {link.label}
                </NavLink>
              );
            })}
        </nav>

        {/* Action Controls: Notifications & Auth State */}
        <div className="flex items-center gap-2.5">
          {/* Notification Bell Dropdown (Authenticated Users) */}
          {user && (
            <div className="relative" ref={bellRef}>
              <button
                type="button"
                onClick={() => setNotificationDropdownOpen((prev) => !prev)}
                className="relative rounded-md p-1.5 text-stone-200 hover:text-white hover:bg-[#1E4D3F] transition-colors"
                title="View travel notices"
                aria-label="View notifications"
              >
                <Bell size={17} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-black text-white">
                    {notifications.length > 9 ? "9+" : notifications.length}
                  </span>
                )}
              </button>

              {/* Notification Popup Dropdown */}
              {notificationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-lg bg-white border border-stone-200 p-3 shadow-xl z-50 text-stone-900">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-2">
                    <span className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                      Travel Notices ({notifications.length})
                    </span>
                    <span className="text-[10px] text-stone-400">Live sync</span>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="py-4 text-center text-xs text-stone-400">No active notices.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="relative rounded-md border border-stone-100 bg-[#FBF9F5] p-2.5 text-xs hover:border-amber-200 transition-colors"
                        >
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-semibold text-stone-800 text-[11px] leading-snug">
                              {n.message}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleDismissNotification(n.id, e)}
                              className="text-stone-400 hover:text-stone-700 p-0.5 rounded"
                              title="Dismiss"
                            >
                              <X size={12} />
                            </button>
                          </div>
                          <span className="block text-[9.5px] text-stone-400 mt-1">
                            {n.sentAt ? new Date(n.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recent"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile / Login Button */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-stone-100 leading-tight">
                  {user.name || user.email.split("@")[0]}
                </span>
                <span className="text-[9.5px] uppercase tracking-wider text-amber-300 font-semibold">
                  {user.role.replace("_", " ")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="flex items-center gap-1.5 rounded-md bg-[#0D2B23] border border-[#235848] px-2.5 py-1 text-xs font-semibold text-stone-200 hover:text-white hover:bg-rose-900/60 transition-colors"
                title="Sign out of account"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-bold text-stone-200 hover:text-white px-2.5 py-1.5 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-amber-600 hover:bg-amber-700 px-3 py-1.5 text-xs font-bold text-white transition-colors shadow-sm"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden rounded-md p-1.5 text-stone-200 hover:text-white hover:bg-[#1E4D3F] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1E4D3F] bg-[#113329] px-4 py-3 space-y-1">
          {navLinks
            .filter((l) => l.show)
            .map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-stone-200 hover:text-white hover:bg-[#163E32] rounded-md"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={15} className="text-amber-400" />
                    {link.label}
                  </span>
                  <ChevronRight size={14} className="text-stone-400" />
                </Link>
              );
            })}
        </div>
      )}
    </header>
  );
}
