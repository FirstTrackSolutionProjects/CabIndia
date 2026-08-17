// src/Components/Header.jsx
import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Car, UserCircle, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { name: "Home", link: "/" },
  { name: "About Us", link: "/about" },
  { name: "Services", link: "/service" },
  { name: "Blog", link: "/blog" },
  { name: "Contact Us", link: "/contact" },
];

// ── Rider Dropdown ──
const RiderDropdown = ({ active }) => {
  const [open, setOpen] = useState(false);
  const leaveTimer = useRef(null);
  const navigate = useNavigate();

  const handleEnter = () => {
    clearTimeout(leaveTimer.current);
    setOpen(true);
  };

  const handleLeave = () => {
    leaveTimer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* trigger */}
      <button
        className={[
          "flex items-center gap-1 transition-colors duration-200 font-medium",
          open || active === "Rider"
            ? "text-yellow-400"
            : "text-white hover:text-yellow-400",
        ].join(" ")}
        onClick={() => navigate("/rider")}
      >
        Rider Login
        <ChevronDown
          size={14}
          strokeWidth={2.5}
          className={`transition-transform duration-300 ${open ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      {/* dropdown panel */}
      <div
        className={[
          "absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 z-50",
          "transition-all duration-250 origin-top",
          open
            ? "opacity-100 translate-y-0 scale-y-100 pointer-events-auto"
            : "opacity-0 -translate-y-2 scale-y-95 pointer-events-none",
        ].join(" ")}
        style={{ transitionTimingFunction: "cubic-bezier(0.34,1.2,0.64,1)" }}
      >
        {/* arrow tip */}
        <div className="flex justify-center -mb-px">
          <div className="w-2.5 h-2.5 bg-gray-800 border-t border-l border-yellow-400/30 rotate-45 rounded-sm" />
        </div>

        {/* panel */}
        <div className="bg-gray-800 border border-yellow-400/20 rounded-2xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.6)]">
          <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />

          <Link
            to="/rider"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3.5 group transition-all duration-200 hover:bg-gray-750 border-b border-gray-700/60"
          >
            <span className="w-9 h-9 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 flex-shrink-0 group-hover:bg-yellow-400 group-hover:text-gray-950 transition-all duration-200">
              <Car size={16} strokeWidth={1.8} />
            </span>
            <span className="flex flex-col">
              <span className="text-white text-sm font-bold leading-tight group-hover:text-yellow-400 transition-colors duration-200">
                Rider Login
              </span>
              <span className="text-gray-500 text-[10px] mt-0.5 leading-tight">
                Drive & earn with CabIndia
              </span>
            </span>
            <span className="ml-auto text-gray-700 group-hover:text-yellow-400 text-xs transition-all duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </Link>

          <Link
            to="/register/join-captain-form"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3.5 group transition-all duration-200 hover:bg-gray-750"
          >
            <span className="w-9 h-9 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 flex-shrink-0 group-hover:bg-yellow-400 group-hover:text-gray-950 transition-all duration-200">
              <UserCircle size={16} strokeWidth={1.8} />
            </span>
            <span className="flex flex-col">
              <span className="text-white text-sm font-bold leading-tight group-hover:text-yellow-400 transition-colors duration-200">
                Become a Captain
              </span>
              <span className="text-gray-500 text-[10px] mt-0.5 leading-tight">
                Register to drive & earn
              </span>
            </span>
            <span className="ml-auto text-gray-700 group-hover:text-yellow-400 text-xs transition-all duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </Link>

          <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />
        </div>
      </div>
    </div>
  );
};

// ── Auth Button ──
const AuthButton = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  if (user) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-3 py-1.5 hover:bg-yellow-400/20 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400 font-bold text-sm">
            {user.name?.charAt(0) || 'U'}
          </div>
          <span className="text-white text-sm font-medium hidden sm:block">
            {user.name?.split(' ')[0] || 'User'}
          </span>
          <ChevronDown size={14} className="text-gray-400" />
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden z-50">
            <Link
              to="/dashboard"
              onClick={() => setShowDropdown(false)}
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/profile"
              onClick={() => setShowDropdown(false)}
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              Profile
            </Link>
            <div className="border-t border-gray-700" />
            <button
              onClick={() => {
                setShowDropdown(false);
                logout();
              }}
              className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        to="/login"
        className="px-4 py-2 text-sm font-medium text-white hover:text-yellow-400 transition-colors"
      >
        Login
      </Link>
      <Link
        to="/register/customer"
        className="px-4 py-2 text-sm font-medium bg-yellow-400 text-gray-950 rounded-xl hover:bg-yellow-300 transition-all"
      >
        Sign Up
      </Link>
    </div>
  );
};

// ── Mobile Menu ──
const MobileMenu = ({ isOpen, toggleMenu }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 top-16 bg-gray-950 z-40 overflow-y-auto">
      <div className="flex flex-col p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.link}
            onClick={toggleMenu}
            className="px-4 py-3 text-white hover:bg-gray-800 rounded-xl transition-colors"
          >
            {item.name}
          </Link>
        ))}
        <div className="border-t border-gray-800 my-2" />
        <Link
          to="/rider"
          onClick={toggleMenu}
          className="px-4 py-3 text-yellow-400 hover:bg-gray-800 rounded-xl transition-colors"
        >
          🚗 Rider Login
        </Link>
        <Link
          to="/register/join-captain-form"
          onClick={toggleMenu}
          className="px-4 py-3 text-yellow-400 hover:bg-gray-800 rounded-xl transition-colors"
        >
          👤 Become a Captain
        </Link>
        {user ? (
          <>
            <Link
              to="/dashboard"
              onClick={toggleMenu}
              className="px-4 py-3 text-white hover:bg-gray-800 rounded-xl transition-colors"
            >
              Dashboard
            </Link>
            <button
              onClick={() => {
                toggleMenu();
                // logout logic
              }}
              className="px-4 py-3 text-red-400 hover:bg-gray-800 rounded-xl transition-colors text-left"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              onClick={toggleMenu}
              className="px-4 py-3 text-white hover:bg-gray-800 rounded-xl transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register/customer"
              onClick={toggleMenu}
              className="px-4 py-3 bg-yellow-400 text-gray-950 rounded-xl text-center font-bold hover:bg-yellow-300 transition-colors"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

// ── Header ──
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [active, setActive] = useState("");

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <header className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img className="h-10 w-auto" src="/logo.png" alt="CabIndia" />
              <span className="text-xl font-bold hidden sm:block">
                <span className="text-white">CAB</span>
                <span className="text-orange-400">IN</span>
                <span className="text-white">D</span>
                <span className="text-green-400">IA</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.link}
                  className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-yellow-400 transition-colors rounded-lg hover:bg-gray-800"
                >
                  {item.name}
                </Link>
              ))}
              <RiderDropdown active={active} />
            </nav>

            {/* Desktop Auth */}
            <div className="hidden md:block">
              <AuthButton />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMenuOpen} toggleMenu={toggleMenu} />
    </>
  );
};

export default Header;