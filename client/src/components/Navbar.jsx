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
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      {/* Top bar — desktop only */}
      <div className="hidden bg-slate-950 lg:block">
        <div className="container mx-auto flex items-center justify-between px-8 py-2 text-[11px] font-medium tracking-[0.18em] uppercase text-slate-200">
          <p>Construction, plumbing, finishing, and hardware supply</p>
          <p>Station Market, Lugari | Call +254 794 517 385</p>
        </div>
      </div>

      {/* Main bar */}
      <div className="border-b border-slate-200 bg-stone-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between gap-3 py-3 lg:gap-6 lg:py-4">
            {/* Logo */}
            <Link to="/" className="min-w-0 flex-1 lg:flex-none">
              <div className="flex items-center gap-2 sm:gap-3">
                <img
                  src="/rjb.png"
                  alt="RJB logo"
                  className="h-10 w-10 flex-shrink-0 rounded-full border border-slate-200 bg-white object-contain p-1 shadow-sm sm:h-11 sm:w-11 lg:h-14 lg:w-14"
                />
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-amber-700 lg:text-[11px]">
                    Since 2009
                  </p>
                  <h1 className="truncate text-sm font-black uppercase tracking-[0.03em] text-slate-900 sm:text-base md:text-lg lg:text-2xl">
                    Radamjaribu Builders
                  </h1>
                </div>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-1 lg:flex xl:gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] xl:px-4 xl:text-sm ${
                    isActiveLink(item.href)
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Desktop actions */}
            <div className="hidden items-center gap-2 lg:flex xl:gap-3">
              <Link
                to="/booking"
                className="rounded-full bg-amber-600 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white hover:bg-amber-700 xl:px-5 xl:py-3 xl:text-sm"
              >
                Request Quote
              </Link>
              {user ? (
                <>
                  <Link
                    to="/admin/dashboard"
                    className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700 hover:text-slate-900 xl:text-sm"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 hover:text-rose-600 xl:text-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700 hover:text-slate-900 xl:text-sm"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile actions */}
            <div className="flex items-center gap-2 lg:hidden">
              <Link
                to="/booking"
                className="rounded-full bg-amber-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-amber-700 sm:px-4 sm:py-2"
              >
                Quote
              </Link>
              <button
                onClick={() => setIsOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-900 hover:border-slate-900"
                aria-label="Toggle navigation menu"
              >
                {isOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown — compact list only */}
        {isOpen && (
          <div className="border-t border-slate-200 bg-white lg:hidden">
            <div className="container mx-auto px-4 py-3 md:px-8">
              <nav className="grid gap-0.5">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold uppercase tracking-wide ${
                      isActiveLink(item.href)
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2.5">
                {user ? (
                  <div className="flex items-center gap-4">
                    <Link
                      to="/admin/dashboard"
                      className="text-sm font-semibold uppercase tracking-wide text-slate-700 hover:text-slate-900"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={logout}
                      className="text-sm font-semibold uppercase tracking-wide text-rose-600 hover:text-rose-700"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="text-sm font-semibold uppercase tracking-wide text-slate-700 hover:text-slate-900"
                  >
                    Login
                  </Link>
                )}
                <span className="text-xs text-slate-400">Lugari, Kakamega</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
