import { Link } from "react-router-dom";
import { Bus, Phone, Mail, MapPin, Share2, MessageCircle, Heart } from "lucide-react";


export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 text-lg font-bold text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900">
                <Bus size={20} strokeWidth={2.5} />
              </span>
              BusGo <span className="text-amber-400">Sri Lanka</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              The smarter way to travel across Sri Lanka. Book tickets, track your bus, and travel with confidence.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-amber-500 hover:text-slate-900 transition-colors">
                <Share2 size={15} />
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-amber-500 hover:text-slate-900 transition-colors">
                <MessageCircle size={15} />
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-amber-500 hover:text-slate-900 transition-colors">
                <Heart size={15} />
              </a>
            </div>

          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Quick Links</h4>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                { to: "/search", label: "Search Buses" },
                { to: "/register", label: "Create Account" },
                { to: "/login", label: "Sign In" },
                { to: "/my-bookings", label: "My Bookings" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-slate-400 hover:text-amber-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Routes */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Popular Routes</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>Colombo → Kandy</li>
              <li>Colombo → Galle</li>
              <li>Colombo → Jaffna</li>
              <li>Kandy → Ella</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Contact Us</h4>
            <ul className="mt-3 space-y-3 text-sm">
              <li className="flex items-start gap-2 text-slate-400">
                <Phone size={14} className="mt-0.5 shrink-0 text-amber-400" />
                +94 11 234 5678
              </li>
              <li className="flex items-start gap-2 text-slate-400">
                <Mail size={14} className="mt-0.5 shrink-0 text-amber-400" />
                support@busgosrilanka.lk
              </li>
              <li className="flex items-start gap-2 text-slate-400">
                <MapPin size={14} className="mt-0.5 shrink-0 text-amber-400" />
                42 Galle Road, Colombo 03, Sri Lanka
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} BusGo Sri Lanka. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-amber-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-amber-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-amber-400 transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
