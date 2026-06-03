import React from "react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-slate-900 text-white">
    {/* Location strip */}
    <div className="border-b border-white/10">
      <div className="container mx-auto grid gap-6 px-4 py-8 md:px-8 lg:grid-cols-2 lg:items-center lg:gap-10 lg:py-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-300">
            Visit Our Office &amp; Store
          </p>
          <h2 className="mt-2 text-xl font-bold sm:text-2xl">
            Quotations, consultations &amp; hardware supplies
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Station Market, Lugari, Kakamega &mdash; +254 794 517 385
          </p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Station+Market+Lugari+Kakamega"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Open in Google Maps
          </a>
        </div>

        {/* Map — hidden on mobile, shown md+ */}
        <div className="hidden overflow-hidden rounded-2xl border border-white/10 shadow-xl md:block">
          <iframe
            title="Radamjaribu Builders location map"
            src="https://www.google.com/maps?q=Station+Market+Lugari+Kakamega&z=15&output=embed"
            className="h-52 w-full lg:h-64"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>

    {/* Links grid */}
    <div className="container mx-auto px-4 py-8 md:px-8 md:py-10">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {/* Brand */}
        <div className="col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2">
            <img
              src="/rjb.png"
              alt="RJB logo"
              className="h-8 w-8 rounded-full bg-white object-contain p-0.5"
            />
            <span className="text-sm font-bold">Radamjaribu Builders</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Building excellence since 2009. Quality construction for residential
            and commercial projects.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Navigate
          </h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/services" className="text-slate-300 hover:text-white">Services</Link></li>
            <li><Link to="/portfolio" className="text-slate-300 hover:text-white">Projects</Link></li>
            <li><Link to="/hardware" className="text-slate-300 hover:text-white">Hardware</Link></li>
            <li><Link to="/contact" className="text-slate-300 hover:text-white">Contact</Link></li>
            <li><Link to="/booking" className="text-slate-300 hover:text-white">Request Quote</Link></li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Services
          </h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>Residential Builds</li>
            <li>Commercial Projects</li>
            <li>Renovations</li>
            <li>Plumbing &amp; Fit-outs</li>
            <li>Hardware Supply</li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row">
        <p>© {new Date().getFullYear()} Radamjaribu Builders. All rights reserved.</p>
        <p>Developed by JaribuTech Solutions</p>
      </div>
    </div>
  </footer>
);

export default Footer;
