import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Car, UserCircle } from "lucide-react";
import Menu from "./Menu";

const navItems = [
  { name: "Home",       link: "/" },
  { name: "Blog",       link: "/blog" },
  
  { name: "About Us",   link: "/about" },
  { name: "Contact Us", link: "/contact" },
  { name: "Sign In",      link: "#",   dropdown: true },
  {
    name: "Chat",
    link: "/chat",
  },
];

const riderOptions = [
  {
    label: "Rider Login",
    sub: "Drive & earn with CabIndia",
    link: "/rider",
    icon: Car,
  },
  {
    label: "Customer Login",
    sub: "Book your next ride",
    link: "/login",
    icon: UserCircle,
  },
];

// ── Rider Dropdown ──
const RiderDropdown = ({ active }) => {
  const [open, setOpen] = useState(false);
  const leaveTimer = useRef(null);

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
          "flex items-center gap-1 transition-colors duration-200",
          open || active === "Rider"
            ? "text-yellow-400 font-bold"
            : "hover:text-yellow-400",
        ].join(" ")}
      >
        Rider
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
          {/* top glow */}
          <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />

          {riderOptions.map((opt, idx) => {
            const Icon = opt.icon;
            return (
              <Link
                key={idx}
                to={opt.link}
                onClick={() => setOpen(false)}
                className={[
                  "flex items-center gap-3 px-4 py-3.5 group transition-all duration-200",
                  "hover:bg-gray-750",
                  idx < riderOptions.length - 1 ? "border-b border-gray-700/60" : "",
                ].join(" ")}
              >
                {/* icon */}
                <span className="w-9 h-9 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 flex-shrink-0 group-hover:bg-yellow-400 group-hover:text-gray-950 transition-all duration-200">
                  <Icon size={16} strokeWidth={1.8} />
                </span>

                {/* text */}
                <span className="flex flex-col">
                  <span className="text-white text-sm font-bold leading-tight group-hover:text-yellow-400 transition-colors duration-200">
                    {opt.label}
                  </span>
                  <span className="text-gray-500 text-[10px] mt-0.5 leading-tight">
                    {opt.sub}
                  </span>
                </span>

                {/* arrow */}
                <span className="ml-auto text-gray-700 group-hover:text-yellow-400 text-xs transition-all duration-200 group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            );
          })}

          {/* bottom glow */}
          <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />
        </div>
      </div>
    </div>
  );
};

// ── Nav Item ──
const NavItem = ({ item, active }) => {
  if (item.dropdown) return <RiderDropdown active={active} />;

  const isExternal =
    item.link.startsWith("http") || item.link.startsWith("https");

  return (
    <div className="relative hover:text-yellow-400 transition-colors duration-200">
      {isExternal ? (
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className={active === item.name ? "font-bold text-yellow-400" : ""}
        >
          {item.name}
        </a>
      ) : (
        <Link
          to={item.link}
          className={active === item.name ? "font-bold text-yellow-400" : ""}
        >
          {item.name}
        </Link>
      )}
    </div>
  );
};

// ── Header ──
const Header = ({ width, active }) => {
  const [isProfileMenu, setIsProfileMenu] = useState(false);
  const [isOpen, setIsOpen]               = useState(false);

  const togglePanel  = () => setIsOpen(!isOpen);
  const toggleProfile = () => setIsProfileMenu(!isProfileMenu);

  return (
    <>
      <style>{`
        .hover\\:bg-gray-750:hover { background-color: #2d3548; }
      `}</style>

      <Menu togglePanel={togglePanel} isOpen={isOpen} navItems={navItems} />

      <div className={`sticky lg:w-${width} w-full z-20 top-0 bg-gray-900`}>
        <div className="relative flex w-full h-16 items-center px-3 py-2 justify-center text-white">
          <div className="relative lg:w-3/5 w-full">
            <div className="flex w-full items-center">

              {/* Logo */}
              <Link to="/" className="flex h-16 items-center">
                <img className="w-10 flex h-16 items-center" src="/logo.png" alt="Logo" />
                &nbsp;
                <span className="text-md font-bold flex">
                  CAB
                  <p className="text-orange-400">IN</p>
                  <p>D</p>
                  <p className="text-green-400">IA</p>
                </span>
              </Link>

              {/* Desktop NavItems */}
              <div className="md:flex justify-between w-96 ml-16 hidden relative z-30 items-center">
                {navItems.map((item, index) => (
                  <NavItem
                    key={index}
                    item={item}
                    active={active}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Profile */}
          <div
            className="w-[150px] h-16 md:flex hidden justify-center items-center ml-12 cursor-pointer"
            onClick={toggleProfile}
          >
            <div className="h-16 flex items-center justify-center mr-3">
              UserName
            </div>
            <div className="h-12 w-12 flex items-center justify-center rounded-full overflow-hidden bg-slate-200">
              <img src="/logo.png" alt="User" />
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Header;