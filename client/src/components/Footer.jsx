import React from 'react';
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="border-b border-white/10 bg-slate-950/60">
        <div className="container mx-auto grid gap-6 px-4 py-10 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-300 sm:text-sm sm:tracking-[0.3em]">
              Visit Our Office and Store
            </p>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              Stop by for quotations, consultations, and materials inquiries
            </h2>
            <p className="mt-4 max-w-xl text-gray-300">
              Visit our location at Station Market, Lugari to discuss your
              project, request a quotation, or check hardware and construction
              supplies in person.
            </p>
            <div className="mt-5 text-sm text-gray-300">
              <p>Station Market, Lugari, Kakamega</p>
              <p>Phone: +254 794 517 385</p>
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Station+Market+Lugari+Kakamega"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Open in Google Maps
            </a>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-white/10 shadow-2xl">
            <iframe
              title="Radamjaribu Builders location map"
              src="https://www.google.com/maps?q=Station+Market+Lugari+Kakamega&z=15&output=embed"
              className="h-[260px] w-full sm:h-[320px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-blue-600 text-white font-bold text-xl p-2 mr-2">R</div>
              <span className="text-xl font-bold">adamjaribu Builders</span>
            </div>
            <p className="text-gray-400 mb-4">
              Building excellence since 2009. Quality construction services for residential and commercial projects.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/services" className="text-gray-400 hover:text-white">Services</Link></li>
              <li><Link to="/portfolio" className="text-gray-400 hover:text-white">Projects</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Residential Construction</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Commercial Buildings</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Renovations</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Project Management</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start">
                <svg className="mt-1 mr-2 h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span>Kakamega,Lugari</span>
              </li>
              <li className="flex items-center">
                <svg className="mr-2 h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <span>(254) 794517385</span>
              </li>
              <li className="flex items-center">
                <svg className="mr-2 h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span>info@radamconstruction.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 space-y-2">
          <p>© {new Date().getFullYear()} Radamjaribu Builders. All rights reserved.</p>
          <p className="text-sm text-gray-500">
            Developed by JaribuTech Solutions
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
