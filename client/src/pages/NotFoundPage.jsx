import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4 text-center">
      <p className="text-[7rem] font-extrabold leading-none text-slate-100 select-none sm:text-[10rem]">
        404
      </p>

      <div className="-mt-4 sm:-mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">
          Page not found
        </p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
          This page doesn't exist
        </h1>
        <p className="mt-3 max-w-md text-slate-500 text-sm leading-6 sm:text-base">
          The link may be broken or the page may have moved. Head back to the
          homepage or go straight to requesting a quote.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
        >
          Back to homepage
        </Link>
        <Link
          to="/booking"
          className="inline-flex items-center justify-center rounded-xl bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-amber-200"
        >
          Request a free quote
        </Link>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
        <Link to="/services" className="hover:text-slate-700 transition">Services</Link>
        <Link to="/portfolio" className="hover:text-slate-700 transition">Portfolio</Link>
        <Link to="/hardware" className="hover:text-slate-700 transition">Hardware</Link>
        <Link to="/contact" className="hover:text-slate-700 transition">Contact</Link>
      </div>
    </div>
  );
}
