import { Link } from "react-router-dom";
import { MapPin, Radio, CreditCard, Shield, Clock, Star, Bus, ChevronRight, Users, Cpu, Trophy } from "lucide-react";

import { useState } from "react";

export default function Home() {
  return (
    <div className="overflow-hidden">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PopularRoutesSection />
      <CTASection />
    </div>
  );
}

function HeroSection() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  const cities = ["Colombo", "Kandy", "Galle", "Jaffna", "Ella", "Nuwara Eliya", "Anuradhapura", "Matara", "Negombo", "Trincomalee"];

  return (
    <section className="relative min-h-[92vh] bg-slate-900 flex items-center overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue-500/8 blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-amber-400/5 blur-3xl animate-spin-slow" />
        {/* Grid pattern */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: content */}
          <div className="animate-fade-slide-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 mb-6">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-live-pulse" />
              <span className="text-sm font-medium text-amber-400">Live bus tracking across Sri Lanka</span>
            </div>

            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-bold leading-[1.08] text-white">
              Travel Smarter,{" "}
              <span className="gradient-text">Book Faster</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed max-w-lg">
              track your bus in real-time, and pay online - all in one seamless experience.
              track your bus in real-time, and pay online -” all in one seamless experience.
            </p>

            {/* Quick search */}
            <div className="mt-10 rounded-2xl bg-white p-4 shadow-2xl shadow-black/30">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Quick Search</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:border-amber-400"
                  >
                    <option value="">From City</option>
                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:border-amber-400"
                  >
                    <option value="">To City</option>
                    {cities.filter(c => c !== origin).map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <Link
                  to={`/search?origin=${origin}&destination=${destination}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-3 font-bold text-slate-900 hover:from-amber-400 hover:to-amber-300 transition-all shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 text-sm"
                >
                  Search Buses ›
                </Link>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-6">
              {[
                { icon: "v", text: "Free cancellation" },
                { icon: "v", text: "Instant e-ticket" },
                { icon: "v", text: "Live bus tracking" },
              ].map((item) => (
                <span key={item.text} className="flex items-center gap-1.5 text-sm text-slate-400">
                  <span className="text-emerald-400 font-bold">{item.icon}</span>
                  {item.text}
                </span>
              ))}
            </div>
          </div>

          {/* Right: visual */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              {/* Main bus card */}
              <div className="relative w-80 rounded-3xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10 animate-float">
                <img
                  src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80"
                  alt="Luxury bus"
                  className="w-full h-64 object-cover"
                />
                <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold">Colombo › Kandy</p>
                      <p className="text-slate-400 text-sm mt-0.5">Luxury * 54 seats</p>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-400 font-bold text-lg">LKR 1,500</p>
                      <p className="text-slate-500 text-xs">per seat</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-live-pulse" />
                    <span className="text-xs text-emerald-400 font-medium">Live tracking available</span>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 glass rounded-2xl p-3 animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Shield size={16} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold">Secure Booking</p>
                    <p className="text-slate-400 text-[10px]">SSL encrypted</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 glass rounded-2xl p-3 animate-float" style={{ animationDelay: '2s' }}>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Star size={16} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold">4.8 Rating</p>
                    <p className="text-slate-400 text-[10px]">2,400+ reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 60L1440 60L1440 20C1200 60 720 0 0 40L0 60Z" fill="#f8fafc" />
        </svg>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { value: "50,000+", label: "Happy Passengers", icon: <Users size={22} className="text-amber-400" /> },
    { value: "4", label: "Major Routes", icon: <MapPin size={22} className="text-amber-400" /> },
    { value: "5", label: "Buses in Fleet", icon: <Bus size={22} className="text-amber-400" /> },
    { value: "4.8 / 5", label: "Average Rating", icon: <Star size={22} className="text-amber-400" /> },

  ];

  return (
    <section className="bg-slate-50 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="card-hover rounded-2xl bg-white border border-slate-100 shadow-sm p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center">
                  {s.icon}
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">{s.value}</p>
              <p className="text-sm text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { icon: <MapPin size={22} />, title: "Pickup & Drop Points", desc: "Choose your exact pickup stop along the route -” not just terminals. Maximum flexibility for every journey.", color: "from-amber-500 to-orange-500" },
    { icon: <Radio size={22} />, title: "Real-Time GPS Tracking", desc: "Watch your bus move live on the map. Know exactly when it reaches your pickup point with precise ETAs.", color: "from-blue-500 to-cyan-500" },
    { icon: <CreditCard size={22} />, title: "Instant E-Ticket", desc: "QR-coded ticket delivered the moment payment is confirmed. No printing, no waiting -” board in seconds.", color: "from-emerald-500 to-teal-500" },
    { icon: <Shield size={22} />, title: "Secure by Design", desc: "Role-based access control, seat hold protection, and encrypted payments keep your booking safe.", color: "from-purple-500 to-violet-500" },
    { icon: <Clock size={22} />, title: "Real-Time Alerts", desc: "Instant notifications the moment a schedule changes, delays happen, or your booking is confirmed.", color: "from-rose-500 to-pink-500" },
    { icon: <Star size={22} />, title: "Verified Reviews", desc: "Real ratings from verified passengers. Make informed decisions before you book your journey.", color: "from-yellow-500 to-amber-500" },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold uppercase tracking-widest text-amber-500">Why BusGo</span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-slate-900">Everything for the perfect trip</h2>
          <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
            From search to boarding, we've redesigned every step to be faster, smarter, and stress-free.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="card-hover group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:border-slate-200"
            >
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${f.color} text-white shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { step: "01", title: "Search Your Route", desc: "Enter origin and destination. Browse all available buses with schedules, prices, and ratings.", icon: <MapPin size={20} /> },
    { step: "02", title: "Pick Your Seat", desc: "View the live seat map. Choose your preferred seat -” left window, right aisle, or the spacious back row.", icon: <Bus size={20} /> },
    { step: "03", title: "Pay Securely", desc: "Pay by card or mobile wallet. Seats are held for 10 minutes while you complete payment.", icon: <Cpu size={20} /> },
    { step: "04", title: "Track & Board", desc: "Receive your QR e-ticket instantly. Track your bus live and board with a quick scan.", icon: <CreditCard size={20} /> },
  ];

  return (
    <section className="py-24 bg-slate-900">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold uppercase tracking-widest text-amber-400">How it works</span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-white">Book in 4 simple steps</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.step} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-amber-500/50 to-transparent z-0" />
              )}
              <div className="relative glass rounded-2xl p-6 card-hover">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl font-black text-amber-400/20">{s.step}</span>
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    {s.icon}
                  </div>
                </div>
                <h3 className="font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PopularRoutesSection() {
  const routes = [
    { from: "Colombo", to: "Kandy", duration: "3h 00m", price: "LKR 1,500", distance: "115 km", buses: 3, img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80" },
    { from: "Colombo", to: "Galle", duration: "2h 30m", price: "LKR 1,500", distance: "120 km", buses: 2, img: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&q=80" },
    { from: "Colombo", to: "Jaffna", duration: "7h 00m", price: "LKR 1,500", distance: "396 km", buses: 1, img: "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=400&q=80" },
    { from: "Kandy", to: "Ella", duration: "5h 00m", price: "LKR 1,500", distance: "140 km", buses: 2, img: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=80" },
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-amber-500">Routes</span>
            <h2 className="mt-2 text-4xl font-bold text-slate-900">Popular routes</h2>
          </div>
          <Link
            to="/search"
            className="hidden sm:flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-amber-600 transition-colors"
          >
            View all routes <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {routes.map((r) => (
            <Link
              key={`${r.from}-${r.to}`}
              to={`/search?origin=${r.from}&destination=${r.to}`}
              className="card-hover group rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm"
            >
              <div className="relative h-36 overflow-hidden">
                <img src={r.img} alt={`${r.from} to ${r.to}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white font-bold text-sm">{r.from} › {r.to}</p>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{r.distance}</span>
                  <span>{r.duration}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-base font-bold text-slate-900">{r.price}</span>
                  <span className="text-xs text-emerald-600 font-medium">{r.buses} buses/day</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(245,158,11,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(59,130,246,0.05) 0%, transparent 50%)' }} />
      <div className="relative mx-auto max-w-4xl px-4 text-center">
        <Trophy size={48} className="mx-auto text-amber-400 mb-6 animate-float" />
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
          Ready for a better<br /><span className="gradient-text">travel experience?</span>
        </h2>
        <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
          Join thousands of Sri Lankan travellers who book smarter with BusGo. Create your free account today.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/register"
            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 font-bold rounded-xl hover:from-amber-400 hover:to-amber-300 transition-all shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 animate-glow-pulse"
          >
            Create Free Account
          </Link>
          <Link
            to="/search"
            className="px-8 py-4 glass border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
          >
            Search Buses ›
          </Link>
        </div>
      </div>
    </section>
  );
}
