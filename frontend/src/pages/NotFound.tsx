import { Link } from "react-router-dom";
import { Bus } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <Bus size={48} className="text-slate-300" />
      <h1 className="mt-4 text-3xl font-bold text-slate-900">404 — Wrong stop</h1>
      <p className="mt-2 text-slate-500">This page doesn't exist. Let's get you back on route.</p>
      <Link to="/" className="mt-6 rounded-lg bg-slate-900 px-5 py-2.5 font-medium text-white hover:bg-slate-700">
        Back to home
      </Link>
    </div>
  );
}
