import React, { useState } from "react";
import { Menu, X } from "lucide-react"; // hamburger & close icons

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <div className="bg-blue-800 text-white font-bold text-xl p-2 mr-0.5 rounded-lg">
            R
          </div>
          <span className="text-xl font-bold text-gray-800">
            adamjaribu Builders
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-8 items-center">
          <a href="/" className="text-blue-600 font-medium">
            Home
          </a>
          <a href="/services" className="text-gray-600 hover:text-blue-600">
            Services
          </a>
          <a href="/portfolio" className="text-gray-600 hover:text-blue-600">
            Projects
          </a>

          <a href="/contact" className="text-gray-600 hover:text-blue-600">
            Contact
          </a>
          <a href="/login" className="text-gray-600 hover:text-blue-600">
            Login
          </a>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
            Get Quote
          </button>
        </nav>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-md">
          <nav className="flex flex-col space-y-4 p-4">
            <a href="/" className="text-blue-600 font-medium">
              Home
            </a>
            <a href="/services" className="text-gray-600 hover:text-blue-600">
              Services
            </a>
            <a href="/portfolio" className="text-gray-600 hover:text-blue-600">
              Projects
            </a>
            <a href="/contact" className="text-gray-600 hover:text-blue-600">
              Contact
            </a>
            <a href="/login" className="text-gray-600 hover:text-blue-600">
              Login
            </a>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded w-full">
              Get Quote
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
