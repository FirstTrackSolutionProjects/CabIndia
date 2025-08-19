import { Hand } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


const NavItem = ({ index, item, active, toggleMenu }) => {
  const [isDropdown, setIsDropdown] = useState(false);
  const toggleDropdown = () => {
    setIsDropdown(!isDropdown);
  };

return (
  <div
    className="relative hover:text-yellow-400"
    onClick={item.dropdown ? toggleDropdown : () => {}}
  >
    <Link key={index} to={item.dropdown ? "#" : item.link}>
      <p className={active === item.name ? "font-bold" : ""}>
        {`${item.name}${item.dropdown ? (isDropdown ? " ▲" : " ▼") : ""}`}
      </p>
    </Link>

    {isDropdown && (
      <div className="absolute top-full left-0 mt-2 w-40 bg-gray-900 text-white rounded-lg shadow-lg z-50">
        {item.dropdownOptions.map((option, idx) => (
          <div
            key={idx}
            onClick={() => toggleMenu()}
            className="py-2 hover:text-yellow-400"
          >
            <Link to={option.link}>
              <p>{option.name}</p>
            </Link>
          </div>
        ))}
      </div>
    )}
  </div>
);

};

const Menu = ({ togglePanel, isOpen, navItems }) => {
  const [isMenu, setIsMenu] = useState(false);
  const toggleMenu = () => setIsMenu(!isMenu);
     const navigate = useNavigate(); // 👈 navigation hook

  const handleLoginClick = () => {
    navigate("/login"); // 👈 navigate to login page
    setIsMenu(false);   // 👈 close menu after clicking
  }; 

  return (
    <>
      <div
        className={`fixed block md:hidden top-0 right-0 ${
          isMenu ? "md:w-96 w-full" : "w-0"
        } h-full bg-white transition-all duration-300 ease-in-out z-50 overflow-hidden`}
      >
        <button
          onClick={toggleMenu}
          className="fixed block md:hidden z-50 top-3 right-4 px-4 py-2 bg-yellow-400 text-black font-bold rounded-md"
        >
          {isMenu ? "X" : "☰"}
        </button>

        <div className="flex flex-col justify-center p-4 bg-gray-900 h-screen text-white items-center">
          <button
            onClick={handleLoginClick}
            className="w-32 px-5 py-2 bg-yellow-400 text-black font-bold rounded-md"
          >
            Login
          </button>

          {navItems.map((item, index) => (
            <div
              key={index}
              onClick={item.dropdown ? () => {} : () => toggleMenu()}
              className="w-full p-3 text-center"
            >
              <NavItem item={item} index={index} active="" toggleMenu={toggleMenu} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Menu;

