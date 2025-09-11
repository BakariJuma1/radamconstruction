import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              RadamJaribuBuilders
            </Link>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
            <Link to="/services" className="text-gray-700 hover:text-blue-600">Services</Link>
            <Link to="/portfolio" className="text-gray-700 hover:text-blue-600">Portfolio</Link>
            <Link to="/booking" className="text-gray-700 hover:text-blue-600">Booking</Link>
            <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>

          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button className="text-gray-700 focus:outline-none">
              ☰
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
