import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AuthContext } from "../AuthContext";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Projects" },
  { href: "/hardware", label: "Hardware" },
  { href: "/contact", label: "Contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const isActiveLink = (href) => {
    if (href === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(href);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="bg-slate-950 text-slate-200">
        <div className="container mx-auto hidden items-center justify-between px-4 py-2 text-[11px] font-medium tracking-[0.18em] lg:flex md:px-8 uppercase">
          <p className="truncate">Construction, plumbing, finishing, and hardware supply</p>
          <p className="truncate text-right">Station Market, Lugari | Call +254 794 517 385</p>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-stone-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between gap-3 py-3 lg:gap-6 lg:py-4">
            <Link to="/" className="min-w-0 flex-1 lg:flex-none">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-sm border border-slate-900 bg-slate-900 text-lg font-black text-white shadow-sm sm:h-12 sm:w-12 sm:text-xl lg:h-14 lg:w-14 lg:text-2xl">
                  R
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-amber-700 sm:text-[10px] lg:text-[11px] lg:tracking-[0.35em]">
                    Since 2009
                  </p>
                  <h1 className="truncate text-sm font-black uppercase tracking-[0.03em] text-slate-900 sm:text-base md:text-xl lg:text-2xl lg:tracking-[0.08em]">
                    Radamjaribu Builders
                  </h1>
                  <p className="hidden truncate text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500 sm:block lg:text-xs lg:tracking-[0.18em]">
                    Construction and Hardware Supply
                  </p>
                </div>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex xl:gap-2">
              {navItems.map((item) => {
                const active = isActiveLink(item.href);

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] xl:px-4 xl:text-sm xl:tracking-[0.18em] ${
                      active
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden items-center gap-2 lg:flex xl:gap-3">
              <Link
                to="/hardware"
                className="hidden rounded-full border border-slate-300 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700 hover:border-slate-900 hover:text-slate-900 xl:inline-flex xl:px-4 xl:text-sm xl:tracking-[0.16em]"
              >
                Hardware Supplies
              </Link>
              <Link
                to="/booking"
                className="rounded-full bg-amber-600 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white hover:bg-amber-700 xl:px-5 xl:py-3 xl:text-sm xl:tracking-[0.18em]"
              >
                Request Quote
              </Link>
              {user ? (
                <>
                  <Link
                    to="/admin/dashboard"
                    className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700 hover:text-slate-900 xl:text-sm xl:tracking-[0.14em]"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 hover:text-rose-600 xl:text-sm xl:tracking-[0.14em]"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700 hover:text-slate-900 xl:text-sm xl:tracking-[0.14em]"
                >
                  Login
                </Link>
              )}
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <Link
                to="/booking"
                className="hidden rounded-full bg-amber-600 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white sm:inline-flex"
              >
                Quote
              </Link>
              <button
                onClick={() => setIsOpen((current) => !current)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-900 hover:border-slate-900 sm:h-12 sm:w-12"
                aria-label="Toggle navigation menu"
              >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        <div
          className={`${isOpen ? "block" : "hidden"} border-t border-slate-200 bg-white lg:hidden`}
        >
          <div className="container mx-auto px-4 py-5 md:px-8">
            <div className="rounded-3xl border border-slate-200 bg-stone-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Build With Confidence
              </p>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-700">
                Residential builds, renovations, plumbing, finishes, and hardware
                supply from one experienced local team.
              </p>

              <nav className="mt-5 grid gap-2">
                {navItems.map((item) => {
                  const active = isActiveLink(item.href);

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] ${
                        active
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Link
                  to="/hardware"
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold uppercase tracking-[0.16em] text-slate-700"
                >
                  Hardware Supplies
                </Link>
                <Link
                  to="/booking"
                  className="rounded-2xl bg-amber-600 px-4 py-3 text-center text-sm font-bold uppercase tracking-[0.16em] text-white"
                >
                  Request Quote
                </Link>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                {user ? (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-700"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={logout}
                      className="text-sm font-semibold uppercase tracking-[0.14em] text-rose-600"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-700"
                  >
                    Login
                  </Link>
                )}
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Lugari, Kakamega
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
