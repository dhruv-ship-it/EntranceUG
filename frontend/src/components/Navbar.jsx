import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/#features', label: 'Features' },
  { to: '/#exams', label: 'Exams' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">
              Entrance<span className="text-primary-600">UG</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                  isActive(link.to) ? 'text-primary-600' : 'text-gray-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden items-center gap-2 md:flex">
            <Link
              to="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              Student Login
            </Link>
            <Link
              to="/mentor/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-accent-600 transition-colors hover:bg-accent-50"
            >
              Mentor Login
            </Link>
            <Link
              to="/admin/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50"
            >
              Admin
            </Link>
            <Link
              to="/signup"
              className="ml-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="border-t border-gray-100 py-4 md:hidden">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 ${
                    isActive(link.to) ? 'text-primary-600' : 'text-gray-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-2 border-gray-100" />
              <Link to="/login" onClick={() => setIsOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Student Login</Link>
              <Link to="/mentor/login" onClick={() => setIsOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-accent-600 hover:bg-accent-50">Mentor Login</Link>
              <Link to="/admin/login" onClick={() => setIsOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50">Admin Login</Link>
              <Link to="/signup" onClick={() => setIsOpen(false)} className="rounded-lg bg-primary-600 px-4 py-2 text-center text-sm font-medium text-white">Get Started</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
