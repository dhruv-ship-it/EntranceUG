import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  Platform: [
    { label: 'Features', to: '/#features' },
    { label: 'Exams', to: '/#exams' },
    { label: 'Pricing', to: '/#pricing' },
  ],
  Resources: [
    { label: 'Mock Tests', to: '/#tests' },
    { label: 'Study Material', to: '/#material' },
    { label: 'Mentorship', to: '/#mentorship' },
  ],
  Company: [
    { label: 'About', to: '/#about' },
    { label: 'Contact', to: '/#contact' },
    { label: 'Careers', to: '/#careers' },
  ],
};


export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <GraduationCap className="h-7 w-7 text-primary-600" />
              <span className="text-lg font-bold text-gray-900">
                Entrance<span className="text-primary-600">UG</span>
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-500">
              Your complete exam preparation companion. Mock tests, mentorship,
              and personalized study plans for IPMAT, JIPMAT, CUET, and more.
            </p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> support@entranceug.com
              </span>
              <span className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> +91 98765 43210
              </span>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-sm font-semibold text-gray-900">{heading}</h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-gray-500 transition-colors hover:text-primary-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 sm:flex-row">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} EntranceUG. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-gray-400">
            <Link to="/privacy" className="hover:text-gray-600">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gray-600">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
