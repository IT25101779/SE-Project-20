import { Link } from "react-router-dom";
import { Bus } from "lucide-react";
import PassengerPageBackground from "../components/PassengerPageBackground";

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#F8F6F0] relative overflow-hidden px-4">
      {/* Subtle Lost Route & Detour Road Watermark */}
      <PassengerPageBackground variant="notfound" opacity={0.20} />

      <div className="mx-auto flex max-w-xl flex-col items-center py-20 text-center relative z-10">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#163E32]/10 border border-[#163E32]/20">
          <Bus size={40} className="text-[#163E32]" />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-[#163E32]">404 — Wrong stop</h1>
        <p className="mt-2 text-[#6B8F82]">This page doesn't exist. Let's get you back on route.</p>
        <Link
          to="/"
          className="mt-6 rounded-lg bg-[#163E32] px-6 py-2.5 font-medium text-white transition-colors hover:bg-[#1C4D3E] shadow-sm"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
