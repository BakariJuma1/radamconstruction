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
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <header className="sticky top-0 z-50">
      <div className="bg-slate-950 text-slate-200">
        <div className="container mx-auto hidden items-center justify-between px-4 py-2 text-xs font-medium tracking-[0.2em] md:flex md:px-8 uppercase">
          <p>Construction, plumbing, finishing, and hardware supply</p>
          <p>Station Market, Lugari | Call +254 794 517 385</p>
        </div>
      </div>

      <div
        className={`border-b border-slate-200 transition-all duration-300 ${
          isScrolled
            ? "bg-white/96 shadow-lg backdrop-blur-md"
            : "bg-stone-50/95 backdrop-blur-sm"
        }`}
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between gap-4 py-4">
            <Link to="/" className="min-w-0 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-sm border border-slate-900 bg-slate-900 text-2xl font-black text-white shadow-sm">
                  R
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-700">
                    Since 2009
                  </p>
                  <h1 className="truncate text-xl font-black uppercase tracking-[0.08em] text-slate-900 md:text-2xl">
                    Radamjaribu Builders
                  </h1>
                  <p className="truncate text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    Construction and Hardware Supply
                  </p>
                </div>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 xl:flex">
              {navItems.map((item) => {
                const active = isActiveLink(item.href);

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] transition-colors duration-200 ${
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

            <div className="hidden items-center gap-3 xl:flex">
              <Link
                to="/hardware"
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
              >
                Hardware Supplies
              </Link>
              <Link
                to="/booking"
                className="rounded-full bg-amber-600 px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-amber-700"
              >
                Request Quote
              </Link>
              {user ? (
                <>
                  <Link
                    to="/admin/dashboard"
                    className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:text-slate-900"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500 transition hover:text-rose-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:text-slate-900"
                >
                  Login
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3 xl:hidden">
              <Link
                to="/booking"
                className="hidden rounded-full bg-amber-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white sm:inline-flex"
              >
                Quote
              </Link>
              <button
                onClick={() => setIsOpen((current) => !current)}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-900 transition hover:border-slate-900"
                aria-label="Toggle navigation menu"
              >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        <div
          className={`overflow-hidden border-t border-slate-200 bg-white transition-all duration-300 xl:hidden ${
            isOpen ? "max-h-[520px]" : "max-h-0"
          }`}
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
                      className={`rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition-colors ${
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
