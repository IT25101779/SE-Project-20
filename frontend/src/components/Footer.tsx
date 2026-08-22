/**
 * Footer Component
 * ----------------
 * Provides the site-wide footer with official transit operational information,
 * provincial route directory, contact details, and compliance statements.
 */

import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#112F26] text-stone-300 border-t border-[#0D261E] pt-12 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Main Footer Column Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 pb-10 border-b border-[#1A4538]">
          {/* Column 1: Organization Branding */}
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-md bg-white p-1 border border-stone-200 flex items-center justify-center shrink-0">
                <img src="/magiya-logo.png" alt="Magiya Logo" className="h-full w-full object-contain" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-extrabold text-white">Magiya</span>
                <span className="text-xs font-bold text-amber-400">(මගියා)</span>
              </div>
            </Link>
            <p className="text-xs text-stone-400 leading-relaxed">
              Lanka Transit Connect (Pvt) Ltd. Intercity express bus scheduling, electronic seat reservations, and real-time fleet GPS monitoring system.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold pt-1">
              <ShieldCheck size={14} />
              <span>NTC Operating Compliance Guidelines</span>
            </div>
          </div>

          {/* Column 2: Passenger Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Passenger Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/search" className="text-stone-300 hover:text-white transition-colors">
                  Search Bus Schedules
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="text-stone-300 hover:text-white transition-colors">
                  My Boarding Passes & QR Tickets
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-stone-300 hover:text-white transition-colors">
                  Passenger Account & Profile
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-stone-300 hover:text-white transition-colors">
                  Sign In to Magiya
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Express Highway Corridors */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Express Corridors
            </h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li>Colombo ── A1 Expressway ── Kandy</li>
              <li>Colombo ── E01 Southern ── Galle / Matara</li>
              <li>Colombo ── A9 Highway ── Jaffna</li>
              <li>Kandy ── Scenic Mountain ── Ella / Badulla</li>
              <li>Colombo ── Katunayake E03 ── Negombo</li>
            </ul>
          </div>

          {/* Column 4: Contact & Operations Desk */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Operations Desk
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-300">
              <li className="flex items-center gap-2">
                <Phone size={13} className="text-amber-400 shrink-0" />
                <span>+94 11 234 5678 (24/7 Helpline)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={13} className="text-amber-400 shrink-0" />
                <span>support@transitconnect.lk</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={13} className="text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-snug">Central Bus Terminal, Bastian Mawatha, Colombo 11, Sri Lanka</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400 gap-3">
          <p>© 2026 Lanka Transit Connect (Pvt) Ltd. All rights reserved.</p>
          <p className="font-mono text-[10px] text-stone-400">
            Official National Expressway Transit Network • Ministry of Transport Sri Lanka
          </p>
        </div>
      </div>
    </footer>
  );
}
