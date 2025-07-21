// import { FC, useState } from "react";
// import { navItems } from "../Constants";
// import { Link } from "react-router-dom";
// import Menu from "./Menu";
// import Register from "./Register";

// interface IHeaderProps {
//   width: string;
//   active: string;
 
// }

// interface INavItemProps {
//   index: number;
//   item : {
//     link : string;
//     name : string;
//     dropdown : Boolean;
//     dropdownOptions : object[];
//   };
//   active : string;
//   toggleMenu: any
// }

// export const NavItem : FC<INavItemProps> = ({index, item, active, toggleMenu}) => {
//   const [isDropdown, setIsDropdown] = useState<Boolean>(false)
//   const toggleDropdown = () => {
//     setIsDropdown(!isDropdown);  
//   }
//   return (
//     <>
//       <div className="relative hover:text-yellow-400" onClick={item.dropdown?(toggleDropdown):(()=>{})}>
        
//       <Link key={index} to={(item.dropdown)?("#"):item.link}><p className={(active===item.name)?"font-bold":""}>{`${item.name}${item.dropdown?(isDropdown?" ▲":" ▼"):""}`}</p></Link>
//       {isDropdown &&
//         (<>
//           <div className="absolute top-8 w-48 p-4 bg-gray-800 text-white  z-50 ">
//             {item.dropdownOptions.map((item: any, index) => (
//               <div onClick={item.dropdown?()=>{}:()=>toggleMenu()} className="py-2 hover:text-yellow-400">
//               <Link key={index} to={item.link}><p className={(active===item.name)?"font-bold":""}>{`${item.name}`}</p></Link>
//               </div>
//             ))}
//           </div>
//         </>)
//       }
//       </div>
      
//     </>
//   )
// }

// const Header : FC<IHeaderProps> = ({width, active  }) => {
//   const [isProfileMenu, setIsProfileMenu] = useState(false)
//   const toggleProfile = () => {
//     setIsProfileMenu(!isProfileMenu)
//   }
//   const [isOpen,setIsOpen] = useState<Boolean>(false)
//   const togglePanel = () => {
//   setIsOpen(!isOpen);
// }
//   const logo = "logo.png";
//   return (
//     <>
//     <Menu  togglePanel={togglePanel} isOpen={isOpen} />
//     <Register togglePanel={togglePanel} isOpen={isOpen} />
//     <div className={`sticky lg:w-${width} w-full z-20 top-0 bg-gray-900 `}>
    
//       <div className="relative flex w-full h-16  items-center px-3 py-2 justify-center text-white">
//         <div className="relative lg:w-3/5 bg-gray-900 w-full">
//           <div className="flex w-full items-center">
//             <Link to={'/'} className="flex h-16 items-center">
//             <img className="w-10" src={logo} alt="" />
//             &nbsp;
//             <span className="text-md font-bold flex">CAB 
//               <p className="text-orange-400">IN</p><p>D</p><p className="text-green-400"> IA</p>
//             </span>
//             </Link>
//               <div className="md:flex justify-between w-96 ml-16 hidden ">
//                 {navItems.map((item : any, index) => (
//                   <NavItem item={item} index={index} active={active} toggleMenu={()=>{}} />
//                 ))}
//             </div>
//           </div>
//         </div>
//         {
//           true && (
//             <div className=" w-[150px] h-16 md:flex hidden justify-center items-center ml-12" onClick={toggleProfile}>
//             <div className="h-16 flex items-center justify-center mr-3">
//               UserName
//             </div>
//             <div className="h-12 w-12 flex items-center justify-center rounded-full overflow-hidden bg-slate-200">
//               <img className="" src="logo.png" alt="" />
//             </div>
//           </div>
//           )
//         }
      
//       </div>
//     </div>
//     </>
//   );
// };

// export default Header;


// import React from "react";
// import { Link } from "react-router-dom";
// import { Menu } from "lucide-react";

// const Header = ({ toggleSidebar }) => {
//   return (
//     <header className="bg-white shadow-md relative z-10">
//       <div className="max-w-6xl mx-auto flex justify-between items-center p-3">
//         <img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-full" />
//         {/* Desktop Nav */}
//         <nav className="hidden md:flex space-x-4 items-center">
//           <Link to="/" className="text-gray-700 hover:text-yellow-500">Home</Link>
//           <Link to="/book" className="text-gray-700 hover:text-yellow-500">Book Ride</Link>
//           <Link to="/captain" className="text-gray-700 hover:text-yellow-500">Become Captain</Link>
//           <Link to="/login" className="text-gray-700 hover:text-yellow-500">Login</Link>
//           <Link to="/register" className="text-gray-700 hover:text-yellow-500">Register</Link>
//           <Link to="/blog" className="text-gray-700 hover:text-yellow-500">Blog</Link>
//           <Link to="/career" className="text-gray-700 hover:text-yellow-500">Career</Link>
//           <Link to="/contact" className="text-gray-700 hover:text-yellow-500">Contact</Link>
//           <div className="relative inline-block group">
//             <button className="text-gray-700 hover:text-yellow-500">Services ▼</button>
//             <div className="absolute hidden group-hover:block mt-2 w-40 bg-white shadow-lg rounded-lg z-20">
//               <Link to="/services/cabs" className="block px-4 py-2 hover:bg-yellow-100 text-gray-700">Cabs</Link>
//               <Link to="/services/food-delivery" className="block px-4 py-2 hover:bg-yellow-100 text-gray-700">Food Delivery</Link>
//               <Link to="/services/parcel-delivery" className="block px-4 py-2 hover:bg-yellow-100 text-gray-700">Parcel Delivery</Link>
//             </div>
//           </div>
//         </nav>

//         {/* Mobile Menu Button */}
//         <div className="md:hidden">
//           <button onClick={toggleSidebar} className="text-gray-700">
//             <Menu size={24} />
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;

import React, { useState } from "react";
import { Link } from "react-router-dom";
import Menu from "./Menu";


// Moved navItems here
const navItems = [
  {
    name: "Services",
    link: "/services",
    dropdown: true,
    dropdownOptions: [
      { name: "Cabs", link: "/cabs" },
      { name: "Food Delivery", link: "https://dulcet-salmiakki-1848c9.netlify.app/" },
      { name: "Parcel Delivery", link: "/parcelDelivery" },
    ],
  },
  { name: "Blog", link: "/blog" },
  // { name: "Career", link: "/career" },
  { name: "Contact Us", link: "/contact" },
];

// Navigation Item
const NavItem = ({ index, item, active, toggleMenu }) => {
  const [isDropdown, setIsDropdown] = useState(false);

  const toggleDropdown = () => {
    if (item.dropdown) {
      setIsDropdown(!isDropdown);
    }
  };

  return (
    <div className="relative hover:text-yellow-400" onClick={toggleDropdown}>
      <Link to={item.dropdown ? "#" : item.link}>
        <p className={active === item.name ? "font-bold" : ""}>
          {item.name}
          {item.dropdown && (isDropdown ? " ▲" : " ▼")}
        </p>
      </Link>

      {isDropdown && item.dropdown && (
        <div className="absolute top-8 w-48 p-4 bg-gray-800 text-white z-50">
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
                <img className="w-10" src={logo} alt="Logo" />
                &nbsp;
                <span className="text-md font-bold flex">
                  CAB <p className="text-orange-400">IN</p>
                  <p>D</p>
                  <p className="text-green-400">IA</p>
                </span>
              </Link>

              {/* Desktop NavItems */}
              <div className="md:flex justify-between w-96 ml-16 hidden">
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
