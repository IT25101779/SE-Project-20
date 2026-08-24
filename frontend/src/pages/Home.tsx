/**
 * Magiya (මගියා) — Official Sri Lankan Intercity Transit Landing Page
 * -------------------------------------------------------------------
 * Designed in the refined editorial style of high-end travel transit platforms
 * (inspired by Ceylon RailFlow / Monocle Transit editorial):
 * - Clean stone/ivory top navigation with wide-tracked typography.
 * - Full-bleed cinematic hero background with authentic Sri Lankan hill country bus photography.
 * - Classic editorial serif typography ("The road from Colombo Fort climbs into the hills").
 * - Right vertical segmented progress indicator & bottom "SCROLL" cue.
 * - Minimalist, high-contrast booking search console.
 * - Editorial sections: "Why Magiya?", "About the Network", "Routes & Corridors",
 *   "Our Team", "Contact & Support", and "Governance & Terms".
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  MapPin, Calendar, ArrowRight, ArrowLeftRight, Clock, Users
} from "lucide-react";

// Key intercity transit hubs across Sri Lanka
const TRANSIT_CITIES = [
  "Colombo", "Kandy", "Galle", "Jaffna", "Ella",
  "Nuwara Eliya", "Anuradhapura", "Matara", "Negombo",
  "Trincomalee", "Kurunegala", "Badulla", "Batticaloa",
  "Kadawatha", "Kegalle", "Ratnapura"
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-stone-900 font-sans selection:bg-[#163E32] selection:text-white">
      {/* 1. EDITORIAL TOP NAVIGATION (Matching Reference Header) */}
      <EditorialTopBar user={user} />

      {/* 2. CINEMATIC FULL-BLEED HERO (Matching Reference Image) */}
      <CinematicHero />

      {/* 3. STREAMLINED SEARCH CONSOLE */}
      <SearchConsoleSection />

      {/* 4. WHY MAGIYA? (Editorial Narrative) */}
      <WhyMagiyaSection />

      {/* 5. ABOUT THE NETWORK */}
      <AboutNetworkSection />

      {/* 6. ROUTES & EXPRESS CORRIDORS */}
      <RoutesSection />

      {/* 7. FLEET & PASSENGER COMFORT */}
      <FleetSection />

      {/* 8. CONTACT & SUPPORT */}
      <ContactSupportSection />

      {/* 10. GOVERNANCE, PRIVACY & TERMS */}
      <LegalTermsSection />
    </div>
  );
}

/* =========================================================================
   1. EDITORIAL TOP BAR (MATCHING REFERENCE HEADER)
   ========================================================================= */
function EditorialTopBar({ user }: { user: any }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E5E0D6] px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <div className="h-9 w-9 rounded-md bg-[#163E32] flex items-center justify-center p-1.5 shadow-2xs">
            <svg viewBox="0 0 24 24" className="w-full h-full text-white fill-current" aria-hidden="true">
              <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
            </svg>
          </div>
          <div>
            <span className="block text-sm sm:text-base font-black tracking-widest text-stone-900 uppercase font-['Playfair_Display',serif]">
              MAGIYA
            </span>
            <span className="block text-[9px] font-bold tracking-[0.22em] text-stone-500 uppercase -mt-0.5">
              CEYLON BUS RESERVATION
            </span>
          </div>
        </Link>

        {/* Center Editorial Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-[11px] font-bold uppercase tracking-[0.16em] text-stone-700">
          <a href="#why-magiya" className="hover:text-[#163E32] transition-colors">
            WHY MAGIYA?
          </a>
          <a href="#about" className="hover:text-[#163E32] transition-colors">
            ABOUT
          </a>
          <a href="#routes" className="hover:text-[#163E32] transition-colors">
            ROUTES
          </a>
          <a href="#contact" className="hover:text-[#163E32] transition-colors">
            CONTACT & SUPPORT
          </a>
          <a href="#legal" className="hover:text-[#163E32] transition-colors">
            PRIVACY
          </a>
          <a href="#legal" className="hover:text-[#163E32] transition-colors">
            TERMS
          </a>
        </nav>

        {/* Right Auth Action Buttons (Matching Screenshot) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/dashboard")}
                className="border border-stone-800 text-stone-900 hover:bg-stone-900 hover:text-white px-3.5 py-1.5 text-[11px] font-bold tracking-wider uppercase rounded-xs transition-colors"
              >
                ACCOUNT ({user.name.split(" ")[0]})
              </button>
              <button
                onClick={() => navigate("/search")}
                className="bg-[#163E32] text-white hover:bg-[#0F2E25] px-4 py-1.5 text-[11px] font-bold tracking-wider uppercase rounded-xs transition-colors"
              >
                BOOK SEATS
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/login")}
                className="border border-stone-800 text-stone-900 hover:bg-stone-900 hover:text-white px-3.5 py-1.5 text-[11px] font-bold tracking-wider uppercase rounded-xs transition-colors cursor-pointer"
              >
                SIGN IN
              </button>
              <button
                onClick={() => navigate("/register")}
                className="border border-stone-800 bg-stone-900 text-white hover:bg-stone-800 px-3.5 py-1.5 text-[11px] font-bold tracking-wider uppercase rounded-xs transition-colors shadow-2xs cursor-pointer"
              >
                CREATE ACCOUNT
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* =========================================================================
   2. CINEMATIC FULL-BLEED HERO (MATCHING REFERENCE COMPOSITION)
   ========================================================================= */
function CinematicHero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-between overflow-hidden bg-stone-950">
      {/* Background Cinematic Image (Uploaded Sri Lankan Scenic Express Bus) */}
      <div className="absolute inset-0 z-0">
        <img
          src="/busp.jpeg"
          alt="Sri Lanka scenic mountain road with express coach"
          className="w-full h-full object-cover object-center"
          loading="eager"
          decoding="sync"
        />
        {/* Editorial Film Vignette / Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-950/40 to-transparent sm:w-3/4" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-stone-950/20" />
      </div>

      {/* Hero Content Left Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 w-full py-16">
        <div className="max-w-2xl text-white">
          {/* Subtle Accent Line */}
          <div className="w-12 h-1 bg-[#FFD700] mb-6 rounded-full" />

          {/* Editorial Title (Playfair Display / Serif) */}
          <h1
            className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.12] font-['Playfair_Display',serif]"
            style={{
              color: "#FFFFFF",
              textShadow: "0 2px 20px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.8)"
            }}
          >
            The road from <br />
            Colombo Fort climbs <br />
            into the hills
          </h1>

          {/* Subtitle Paragraph */}
          <p
            className="mt-5 text-sm sm:text-base text-stone-100 leading-relaxed max-w-lg font-light"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}
          >
            Sri Lanka’s highway network runs from the coast up through tea country to Kandy, Galle, and Jaffna. Magiya is how you book a seat on it.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/search")}
              className="bg-[#D46B24] hover:bg-[#BA5615] text-white px-7 py-3 rounded-xs text-xs font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95 cursor-pointer inline-flex items-center gap-2"
            >
              <span>BOOK A SEAT</span>
              <ArrowRight size={13} />
            </button>
            <a
              href="#routes"
              className="border border-white/60 bg-black/30 hover:bg-white hover:text-stone-900 text-white px-6 py-3 rounded-xs text-xs font-bold uppercase tracking-widest transition-all backdrop-blur-xs"
            >
              EXPLORE ROUTES
            </a>
          </div>
        </div>
      </div>

      {/* Right Vertical Segmented Progress Indicator (Matching Reference Image) */}
      <div className="hidden lg:flex flex-col gap-2.5 absolute right-8 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <span className="h-8 w-1 bg-sky-400 rounded-full shadow-sm" />
        <span className="h-5 w-1 bg-white/40 rounded-full" />
        <span className="h-5 w-1 bg-white/40 rounded-full" />
        <span className="h-5 w-1 bg-white/40 rounded-full" />
      </div>

      {/* Bottom Center Scroll Cue (Matching Reference Image) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-center text-white/80 pointer-events-none select-none">
        <div className="flex flex-col items-center gap-1 font-mono text-[9px] tracking-[0.3em] uppercase">
          <span>SCROLL</span>
          <span className="text-xs animate-bounce">↓</span>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   3. STREAMLINED SEARCH CONSOLE
   ========================================================================= */
function SearchConsoleSection() {
  const navigate = useNavigate();

  const [origin, setOrigin] = useState("Colombo");
  const [destination, setDestination] = useState("Kandy");

  const todayStr = new Date().toISOString().split("T")[0];
  const [departureDate, setDepartureDate] = useState(todayStr);
  const [passengerCount, setPassengerCount] = useState(1);

  function handleSwap() {
    setOrigin(destination);
    setDestination(origin);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(
      `/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${departureDate}&passengers=${passengerCount}`
    );
  }

  return (
    <section className="relative z-20 -mt-10 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="bg-[#FAF7F2] border border-[#D5CFBE] rounded-xl p-5 sm:p-7 shadow-xl shadow-stone-900/10">
        <div className="flex items-center justify-between mb-4 border-b border-[#E5E0D6] pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#163E32]" />
            <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
              National Intercity Express Timetable Search
            </span>
          </div>
          <span className="text-[11px] font-mono text-stone-500 hidden sm:inline">
            Direct & Expressway Connections
          </span>
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* Origin */}
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
              From (Departure)
            </label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#163E32]" />
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 bg-white border border-[#D5CFBE] rounded-md text-xs font-bold text-stone-800 focus:outline-none focus:border-[#163E32]"
              >
                {TRANSIT_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="sm:col-span-1 flex justify-center pb-1">
            <button
              type="button"
              onClick={handleSwap}
              className="h-9 w-9 rounded-md border border-[#D5CFBE] bg-white text-stone-600 hover:text-[#163E32] flex items-center justify-center transition-all cursor-pointer"
              title="Swap Cities"
            >
              <ArrowLeftRight size={13} />
            </button>
          </div>

          {/* Destination */}
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
              To (Destination)
            </label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D46B24]" />
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 bg-white border border-[#D5CFBE] rounded-md text-xs font-bold text-stone-800 focus:outline-none focus:border-[#163E32]"
              >
                {TRANSIT_CITIES.filter((c) => c !== origin).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Travel Date */}
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
              Date
            </label>
            <div className="relative">
              <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="date"
                min={todayStr}
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 bg-white border border-[#D5CFBE] rounded-md text-xs font-bold text-stone-800 focus:outline-none focus:border-[#163E32]"
              />
            </div>
          </div>

          {/* Seats / Passengers */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
              Seats
            </label>
            <div className="relative">
              <Users size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <select
                value={passengerCount}
                onChange={(e) => setPassengerCount(Number(e.target.value))}
                className="w-full pl-8 pr-2 py-2.5 bg-white border border-[#D5CFBE] rounded-md text-xs font-bold text-stone-800 focus:outline-none focus:border-[#163E32]"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "seat" : "seats"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search CTA */}
          <div className="sm:col-span-3">
            <button
              type="submit"
              className="w-full bg-[#163E32] hover:bg-[#0F2E25] text-white py-2.5 px-4 rounded-md text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <span>FIND BUS</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

/* =========================================================================
   4. WHY MAGIYA? (EDITORIAL ESSAY ON TRANSIT DIGNITY)
   ========================================================================= */
function WhyMagiyaSection() {
  return (
    <section id="why-magiya" className="py-20 px-6 max-w-5xl mx-auto scroll-mt-20">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#D46B24] block mb-2 font-mono">
          THE PHILOSOPHY
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 font-['Playfair_Display',serif]">
          A dignified way to travel across Sri Lanka
        </h2>
        <p className="mt-4 text-sm text-stone-600 leading-relaxed font-light">
          For decades, boarding an intercity bus in Sri Lanka meant enduring chaotic crowds at Bastian Mawatha, standing for hours along the coastal road, and guessing when the next bus would depart. Magiya changes this fundamentally.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-b border-[#E2DDD5] py-12">
        <div className="space-y-3">
          <span className="font-mono text-xs font-bold text-[#163E32] block">01 / GUARANTEED SEAT</span>
          <h3 className="text-lg font-bold text-stone-900 font-['Playfair_Display',serif]">
            No Standing, Ever
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed font-light">
            Every ticket guarantees your exact assigned seat. Once selected, your seat is locked atomically in the database for 10 minutes so no one can take it while you pay.
          </p>
        </div>

        <div className="space-y-3">
          <span className="font-mono text-xs font-bold text-[#163E32] block">02 / LIVE SATELLITE GPS</span>
          <h3 className="text-lg font-bold text-stone-900 font-['Playfair_Display',serif]">
            Real-Time Vehicle Position
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed font-light">
            All registered expressway coaches transmit GPS coordinates every 5 seconds. Know exactly when your coach passes Kottawa, Kadawatha, or Dodangoda.
          </p>
        </div>

        <div className="space-y-3">
          <span className="font-mono text-xs font-bold text-[#163E32] block">03 / CONTACTLESS PASS</span>
          <h3 className="text-lg font-bold text-stone-900 font-['Playfair_Display',serif]">
            Encrypted QR E-Tickets
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed font-light">
            Paperless boarding verified in 1 second. Conductors scan your smartphone screen directly at the coach door using our synchronized manifest system.
          </p>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   5. ABOUT THE NETWORK
   ========================================================================= */
function AboutNetworkSection() {
  return (
    <section id="about" className="py-16 bg-[#F3EDE2] border-y border-[#E2DDD5] px-6 scroll-mt-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-5 space-y-4">
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-stone-500 font-mono">
            ABOUT THE NETWORK
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-['Playfair_Display',serif] leading-snug">
            Uniting 9 Provinces Through Modern Expressway Corridors
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
            Magiya operates in partnership with licensed expressway coach associations regulated by the National Transport Commission (NTC). From the Southern E01 Expressway to the Northern A9 arterial, our platform delivers predictable timetables and verified bookings.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-3 text-stone-800">
            <div className="border-l-2 border-[#163E32] pl-3">
              <div className="font-mono font-bold text-xl text-[#163E32]">340+</div>
              <div className="text-[11px] text-stone-500 font-medium">Daily Scheduled Services</div>
            </div>
            <div className="border-l-2 border-[#D46B24] pl-3">
              <div className="font-mono font-bold text-xl text-[#D46B24]">99.4%</div>
              <div className="text-[11px] text-stone-500 font-medium">On-Time Departure Rate</div>
            </div>
          </div>
        </div>

        {/* Scenic Photo Card */}
        <div className="lg:col-span-7">
          <div className="rounded-xl overflow-hidden border border-[#D5CFBE] shadow-lg aspect-[16/10] relative group">
            <img
              src="/busp.jpeg"
              alt="Magiya Sri Lankan Express Bus"
              className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700"
            />
            <div className="absolute bottom-3 left-3 px-3 py-1 bg-stone-900/80 backdrop-blur-xs rounded text-[10px] text-white font-mono">
              E01 SOUTHERN EXPRESSWAY • PINNADUWA PASS
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   6. ROUTES & EXPRESS CORRIDORS (PRESENTED LIKE TRAIN/HIGHWAY LINES)
   ========================================================================= */
function RoutesSection() {
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split("T")[0];

  const LINES = [
    {
      line: "LINE 01",
      name: "The Southern Expressway Line",
      route: "EX-01",
      path: "Colombo (Makumbura MMC) ⇄ Galle Fort ⇄ Matara",
      duration: "1h 45m",
      highway: "E01 Southern Express",
      fare: "Rs. 950",
      from: "Colombo",
      to: "Galle"
    },
    {
      line: "LINE 02",
      name: "The Central Heritage Line",
      route: "Route 01",
      path: "Colombo Fort ⇄ Kadugannawa Pass ⇄ Kandy Goods Shed",
      duration: "3h 15m",
      highway: "E04 & A1 Highway",
      fare: "Rs. 1,200",
      from: "Colombo",
      to: "Kandy"
    },
    {
      line: "LINE 03",
      name: "The Highland Mountain Line",
      route: "Route 22",
      path: "Kandy ⇄ Nuwara Eliya Tea Country ⇄ Ella Gap",
      duration: "4h 10m",
      highway: "Scenic Hill Country Pass",
      fare: "Rs. 1,600",
      from: "Kandy",
      to: "Ella"
    },
    {
      line: "LINE 04",
      name: "The Northern Peninsula Line",
      route: "Route 87",
      path: "Colombo Bastian Mawatha ⇄ Anuradhapura ⇄ Jaffna",
      duration: "7h 30m",
      highway: "A9 Northern Expressway",
      fare: "Rs. 2,800",
      from: "Colombo",
      to: "Jaffna"
    }
  ];

  function handleBook(from: string, to: string) {
    navigate(`/search?origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&date=${todayStr}`);
  }

  return (
    <section id="routes" className="py-20 px-6 max-w-6xl mx-auto scroll-mt-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#D46B24] font-mono block mb-1">
            KEY CORRIDORS
          </span>
          <h2 className="text-3xl font-bold text-stone-900 font-['Playfair_Display',serif]">
            Express Highway & Intercity Lines
          </h2>
        </div>
        <button
          onClick={() => navigate("/search")}
          className="text-xs font-bold uppercase tracking-widest text-[#163E32] hover:underline inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
        >
          <span>VIEW FULL TIMETABLE</span>
          <ArrowRight size={12} />
        </button>
      </div>

      <div className="divide-y divide-[#E2DDD5] border-t border-b border-[#E2DDD5]">
        {LINES.map((l) => (
          <div
            key={l.line}
            onClick={() => handleBook(l.from, l.to)}
            className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/60 px-4 -mx-4 rounded-lg transition-colors cursor-pointer group"
          >
            <div className="flex items-start md:items-center gap-4">
              <span className="font-mono text-xs font-bold text-[#163E32] bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
                {l.route}
              </span>
              <div>
                <h3 className="font-bold text-base text-stone-900 group-hover:text-[#163E32] transition-colors font-['Playfair_Display',serif]">
                  {l.name}
                </h3>
                <p className="text-xs text-stone-500 font-light mt-0.5">
                  {l.path} • <span className="font-semibold text-stone-700">{l.highway}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6 text-xs shrink-0">
              <span className="text-stone-500 flex items-center gap-1">
                <Clock size={12} className="text-stone-400" />
                {l.duration}
              </span>
              <span className="font-mono font-bold text-stone-900 text-sm">
                {l.fare}
              </span>
              <span className="text-[#D46B24] font-bold text-[11px] uppercase tracking-wider group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                RESERVE <ArrowRight size={11} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================================
   7. FLEET & PASSENGER COMFORT
   ========================================================================= */
function FleetSection() {
  const FLEET_FEATURES = [
    { title: "Ergonomic Reclining Seats", desc: "Designed for long-haul spinal support with adjustable calf rests on express coaches." },
    { title: "Individual USB & Power", desc: "Charge smartphones and devices directly at each seat throughout the voyage." },
    { title: "Full Cabin Air Conditioning", desc: "Clean HEPA-filtered climate control tuned for Sri Lanka's tropical climate." },
    { title: "Luggage Bay Hold", desc: "Secure under-carriage luggage compartments for up to 25kg per passenger." },
  ];

  return (
    <section className="py-16 bg-[#F3EDE2] border-y border-[#E2DDD5] px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-stone-500 font-mono">
            FLEET SPECIFICATIONS
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-['Playfair_Display',serif] mt-1">
            Engineered For Passenger Comfort
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {FLEET_FEATURES.map((f, i) => (
            <div key={i} className="bg-white/80 border border-[#D5CFBE] p-5 rounded-lg space-y-2">
              <span className="font-mono text-xs text-[#163E32] font-bold">0{i + 1}</span>
              <h3 className="font-bold text-sm text-stone-900">{f.title}</h3>
              <p className="text-xs text-stone-600 font-light leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   8. CONTACT & SUPPORT
   ========================================================================= */
function ContactSupportSection() {
  return (
    <section id="contact" className="py-16 bg-[#163E32] text-white px-6 scroll-mt-20">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <span className="text-[10px] font-mono tracking-[0.2em] text-emerald-300 uppercase block mb-1">
            TERMINAL OPERATIONS
          </span>
          <h3 className="text-xl font-bold font-['Playfair_Display',serif] mb-2">
            Central Dispatch Desk
          </h3>
          <p className="text-xs text-stone-300 font-light leading-relaxed">
            Bastian Mawatha Multimodal Bus Stand, Colombo 11. Open 24/7 for intercity expressway connections.
          </p>
        </div>

        <div>
          <span className="text-[10px] font-mono tracking-[0.2em] text-emerald-300 uppercase block mb-1">
            TELEPHONE & HOTLINE
          </span>
          <h3 className="text-xl font-bold font-['Playfair_Display',serif] mb-2">
            1955 (NTC National Desk)
          </h3>
          <p className="text-xs text-stone-300 font-light leading-relaxed">
            Direct dispatch and passenger assistance: <br />
            +94 11 258 1120 / +94 11 258 1121
          </p>
        </div>

        <div>
          <span className="text-[10px] font-mono tracking-[0.2em] text-emerald-300 uppercase block mb-1">
            ELECTRONIC INQUIRIES
          </span>
          <h3 className="text-xl font-bold font-['Playfair_Display',serif] mb-2">
            support@magiya.lk
          </h3>
          <p className="text-xs text-stone-300 font-light leading-relaxed">
            Automated notifications, schedule changes, and refund inquiries processed within 24 hours.
          </p>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   9. LEGAL, PRIVACY & TERMS
   ========================================================================= */
function LegalTermsSection() {
  return (
    <section id="legal" className="py-12 px-6 max-w-5xl mx-auto text-xs text-stone-500 font-light border-t border-[#E2DDD5] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-stone-700">Magiya (මගියා) Intercity Transit System</p>
          <p className="text-[11px]">Official express transit reservation platform regulated under National Transport Commission (NTC) standards.</p>
        </div>
        <div className="flex items-center gap-6 text-[11px] font-mono uppercase tracking-wider">
          <a href="#legal" className="hover:text-stone-900">Privacy Policy</a>
          <a href="#legal" className="hover:text-stone-900">Conditions of Carriage</a>
          <a href="#legal" className="hover:text-stone-900">Refund Guidelines</a>
        </div>
      </div>
    </section>
  );
}
