import React, { useState } from "react";
import { Link } from "react-router-dom";
import Menu from "./Menu";


// Moved navItems here
const navItems = [
  // {
  //   name: "Services",
  //   link: "/services",
  //   dropdown: true,
  //   dropdownOptions: [
  //     { name: "Cabs", link: "/cabs" },
  //     { name: "Food Delivery"
  //       // , link: "https://dulcet-salmiakki-1848c9.netlify.app/" 
  //     },
  //     { name: "Parcel Delivery"
  //       // , link: "/parcelDelivery" 
  //     },
  //   ],
  // },
  { name: "Home", link: "/"},
  { name: "Blog", link: "/blog" },
  { name : "Rider", link: "/rider"},
  // { name: "Career", link: "/career" },
  { name: "About Us", link: "/about" },
  { name: "Contact Us", link: "/contact" },
  { 
    name: "Chat", 
    link: "https://wa.me/911234567890?text=Hello%20AI%20Assistant,%20I%20want%20to%20know%20more%20about%20your%20services."
  },
];

// Navigation Item
const NavItem = ({ index, item, active, toggleMenu }) => {
  const [isDropdown, setIsDropdown] = useState(false);

  const toggleDropdown = () => {
    if (item.dropdown) {
      setIsDropdown(!isDropdown);
    }
  };

   const isExternal = item.link.startsWith("http") || item.link.startsWith("https");

  return (
    <div className="relative inline-block hover:text-yellow-400" onClick={toggleDropdown}>

      {isExternal ? (
        <a 
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`cursor-pointer ${active === item.name ? "font-bold" : ""}`}
        >
          {item.name}
        </a>
      ) : (
      <Link to={item.dropdown ? "#" : item.link}>
        <p className={active === item.name ? "font-bold" : ""}>
          {item.name}
          {item.dropdown && (isDropdown ? " ▲" : " ▼")}
        </p>
      </Link>
      )}

      {isDropdown && item.dropdown && (
        <div className="relative top-full left-1/2 -translate-x-1/2 mt-2 w-48 p- bg-gray-900 text-white z-50 rounded-lg shadow-lg">
          {item.dropdownOptions.map((option, idx) => (
            <div
              key={idx}
              onClick={() => toggleMenu()}
              className="py-2 hover:text-yellow-400"
            >
              <Link to={option.link}>
                <p className={active === option.name ? "font-bold" : ""}>
                  {option.name}
                </p>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Header Component
const Header = ({ width, active }) => {
  const [isProfileMenu, setIsProfileMenu] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const togglePanel = () => setIsOpen(!isOpen);
  const toggleProfile = () => setIsProfileMenu(!isProfileMenu);

  const logo = "logo.png";

  return (
    <>
      {/* Slide Menu */}
      <Menu togglePanel={togglePanel} isOpen={isOpen} navItems={navItems} />

      {/* Top Navigation Bar */}
      <div className={`sticky lg:w-${width} w-full z-20 top-0 bg-gray-900`}>
        <div className="relative flex w-full h-16 items-center px-3 py-2 justify-center text-white">
          <div className="relative lg:w-3/5 w-full">
            <div className="flex w-full items-center">
              {/* Logo */}
              <Link to="/" className="flex h-16 items-center">
                <img className="w-10 flex h-16 items-center" src="/logo.png" alt="Logo" />
                &nbsp;
                <span className="text-md font-bold flex">
                  CAB <p className="text-orange-400">IN</p>
                  <p>D</p>
                  <p className="text-green-400">IA</p>
                </span>
              </Link>

              {/* Desktop NavItems */}
              <div className="md:flex justify-between w-96 ml-16 hidden relative z-30">
                {navItems.map((item, index) => (
                  <NavItem
                    key={index}
                    item={item}
                    index={index}
                    active={active}
                    toggleMenu={() => {}}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Profile (Only shown on desktop for now) */}
          <div
            className="w-[150px] h-16 md:flex hidden justify-center items-center ml-12 cursor-pointer"
            onClick={toggleProfile}
          >
            <div className="h-16 flex items-center justify-center mr-3">
              UserName
            </div>
            <div className="h-12 w-12 flex items-center justify-center rounded-full overflow-hidden bg-slate-200">
              <img src={logo} alt="User" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;

