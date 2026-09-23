import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  description:
    "The requested meteorological page or location route could not be found on hawapani.",
};

const POPULAR_CITIES = [
  { name: "Kathmandu", query: "Kathmandu" },
  { name: "London", query: "London" },
  { name: "Tokyo", query: "Tokyo" },
  { name: "New York", query: "New York" },
];

export default function NotFound() {
  return (
    <main
      id="main-content"
      role="main"
      tabIndex={-1}
      className="flex min-h-[100dvh] w-full flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 text-white select-none outline-hidden"
    >
      <div className="flex w-full max-w-lg flex-col items-center justify-center rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 sm:p-10 text-center shadow-2xl">
        {/* Status Pill */}
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3.5 py-1 text-xs font-semibold text-blue-300 border border-blue-400/30">
          <span>📡</span>
          <span>404 • Lost in the Atmosphere</span>
        </div>

        {/* Visual Thematic Icon */}
        <div
          aria-hidden="true"
          className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-4xl border border-white/20 shadow-inner"
        >
          🧭
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
          Lost in the Clouds
        </h1>

        {/* Descriptive Guidance */}
        <p className="text-xs sm:text-sm text-slate-300 mb-6 max-w-md leading-relaxed">
          The weather coordinates or page you are searching for seem to have
          drifted away into the upper atmosphere. Check the URL or return to the
          active dashboard.
        </p>

        {/* Primary Action Button */}
        <div className="mb-6 flex items-center justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg hover:bg-blue-500 active:bg-blue-700 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-hidden"
          >
            <span>🌤️</span>
            <span>Return to Dashboard</span>
          </Link>
        </div>

        {/* Quick Destinations */}
        <div className="w-full border-t border-white/10 pt-5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-3">
            Or jump to a featured location
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {POPULAR_CITIES.map((city) => (
              <Link
                key={city.name}
                href={`/?q=${encodeURIComponent(city.query)}`}
                className="rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/20 hover:text-white transition border border-white/15 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-hidden"
              >
                📍 {city.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
