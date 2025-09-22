import React, { useState, useContext, useEffect } from "react";
import { Menu, X, ChevronDown, User, LogOut, Quote } from "lucide-react";
import { AuthContext } from "../AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useContext(AuthContext);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/portfolio", label: "Projects" },
    { href: "/contact", label: "Contact" },
  ];

  const NavLink = ({ href, children, isActive = false, mobile = false }) => (
    <a
      href={href}
      className={`
        relative transition-all duration-300 font-medium group
        ${mobile ? 
          "py-3 px-4 rounded-lg hover:bg-blue-50 border-l-4 border-transparent hover:border-blue-600" :
          "px-3 py-2 rounded-lg hover:bg-blue-50/80"
        }
        ${isActive ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600"}
      `}
    >
      {children}
      {!mobile && (
        <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-4/5 group-hover:left-[10%]" />
      )}
    </a>
  );

  return (
    <header className={`
      sticky top-0 z-50 transition-all duration-300
      ${isScrolled 
        ? "bg-white/95 backdrop-blur-md shadow-lg py-2" 
        : "bg-white/80 backdrop-blur-sm shadow-sm py-4"
      }
    `}>
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
        {/* Logo */}
        <a href="/" className="flex items-center group">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white font-bold text-xl p-2 mr-3 rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-105">
            R
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            adamjaribu Builders
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
          
          {/* User Section */}
          <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
            {user ? (
              <div className="flex items-center space-x-3">
                <a 
                  href="/admin/dashboard"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  <User size={18} />
                  <span>Dashboard</span>
                </a>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors duration-200"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <a 
                href="/login"
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                Login
              </a>
            )}
            
            {/* CTA Button */}
            <a
              href="/contact"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <Quote size={18} />
              <span>Get Quote</span>
            </a>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center space-x-3">
          {user && (
            <a 
              href="/admin/dashboard"
              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <User size={20} />
            </a>
          )}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`
        lg:hidden bg-white/95 backdrop-blur-md shadow-2xl border-t border-gray-100
        transition-all duration-300 overflow-hidden
        ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
      `}>
        <nav className="flex flex-col p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href} mobile>
              {item.label}
            </NavLink>
          ))}
          
          {/* Mobile Auth Section */}
          <div className="pt-4 mt-4 border-t border-gray-200 space-y-3">
            {user ? (
              <>
                <a
                  href="/admin/dashboard"
                  className="flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-blue-50 text-gray-700"
                >
                  <User size={18} />
                  <span>Dashboard</span>
                </a>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-red-50 text-gray-700 w-full text-left"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <a
                href="/login"
                className="block py-3 px-4 rounded-lg hover:bg-blue-50 text-gray-700 font-medium"
              >
                Login
              </a>
            )}
            
            <a
              href="/contact"
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-4 rounded-lg mt-2 shadow-lg"
            >
              <Quote size={18} />
              <span>Get Free Quote</span>
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;