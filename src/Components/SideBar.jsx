import React from "react";
import { Link } from "react-router-dom";

const SideBar = ({ isOpen, closeSidebar }) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-lg transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-bold text-yellow-500">Menu</h2>
          <button onClick={closeSidebar} className="text-2xl text-gray-700">
            &times;
          </button>
        </div>

        {/* Menu Links */}
        <nav className="flex flex-col space-y-3 p-5 text-gray-800 font-medium">
          <Link to="/" onClick={closeSidebar} className="hover:text-yellow-500">Home</Link>
          <Link to="/book" onClick={closeSidebar} className="hover:text-yellow-500">Book Ride</Link>
          <Link to="/captain" onClick={closeSidebar} className="hover:text-yellow-500">Become Captain</Link>
          <Link to="/login" onClick={closeSidebar} className="hover:text-yellow-500">Login</Link>
          <Link to="/register" onClick={closeSidebar} className="hover:text-yellow-500">Register</Link>
          <Link to="/blog" onClick={closeSidebar} className="hover:text-yellow-500">Blog</Link>
          {/* <Link to="/career" onClick={closeSidebar} className="hover:text-yellow-500">Career</Link> */}
          <Link to="/contact" onClick={closeSidebar} className="hover:text-yellow-500">Contact</Link>

          {/* Dropdown Services */}
          <details className="group">
            <summary className="cursor-pointer hover:text-yellow-500">
              Services
            </summary>
            <div className="ml-4 mt-2 space-y-2 text-sm">
              <Link to="/services/cabs" onClick={closeSidebar} className="block hover:text-yellow-500">
                Cabs
              </Link>
              <Link to="/services/food-delivery" onClick={closeSidebar} className="block hover:text-yellow-500">
                Food Delivery
              </Link>
              <Link to="/services/parcel-delivery" onClick={closeSidebar} className="block hover:text-yellow-500">
                Parcel Delivery
              </Link>
            </div>
          </details>
        </nav>
      </div>
    </>
  );
};

export default SideBar;
