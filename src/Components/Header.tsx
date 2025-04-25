import { FC, useState } from "react";
import { navItems } from "../Constants";
import { Link } from "react-router-dom";
import Menu from "./Menu";
import Register from "./Register";

interface IHeaderProps {
  width: string;
  active: string;
 
}

interface INavItemProps {
  index: number;
  item : {
    link : string;
    name : string;
    dropdown : Boolean;
    dropdownOptions : object[];
  };
  active : string;
  toggleMenu: any
}

export const NavItem : FC<INavItemProps> = ({index, item, active, toggleMenu}) => {
  const [isDropdown, setIsDropdown] = useState<Boolean>(false)
  const toggleDropdown = () => {
    setIsDropdown(!isDropdown);  
  }
  return (
    <>
      <div className="relative hover:text-yellow-400" onClick={item.dropdown?(toggleDropdown):(()=>{})}>
        
      <Link key={index} to={(item.dropdown)?("#"):item.link}><p className={(active===item.name)?"font-bold":""}>{`${item.name}${item.dropdown?(isDropdown?" ▲":" ▼"):""}`}</p></Link>
      {isDropdown &&
        (<>
          <div className="absolute top-8 w-48 p-4 bg-gray-800 text-white  z-50 ">
            {item.dropdownOptions.map((item: any, index) => (
              <div onClick={item.dropdown?()=>{}:()=>toggleMenu()} className="py-2 hover:text-yellow-400">
              <Link key={index} to={item.link}><p className={(active===item.name)?"font-bold":""}>{`${item.name}`}</p></Link>
              </div>
            ))}
          </div>
        </>)
      }
      </div>
      
    </>
  )
}

const Header : FC<IHeaderProps> = ({width, active  }) => {
  const [isProfileMenu, setIsProfileMenu] = useState(false)
  const toggleProfile = () => {
    setIsProfileMenu(!isProfileMenu)
  }
  const [isOpen,setIsOpen] = useState<Boolean>(false)
  const togglePanel = () => {
  setIsOpen(!isOpen);
}
  const logo = "logo.png";
  return (
    <>
    <Menu  togglePanel={togglePanel} isOpen={isOpen} />
    <Register togglePanel={togglePanel} isOpen={isOpen} />
    <div className={`sticky lg:w-${width} w-full z-20 top-0 bg-gray-900 `}>
    
      <div className="relative flex w-full h-16  items-center px-3 py-2 justify-center text-white">
        <div className="relative lg:w-3/5 bg-gray-900 w-full">
          <div className="flex w-full items-center">
            <Link to={'/'} className="flex h-16 items-center">
            <img className="w-10" src={logo} alt="" />
            &nbsp;
            <span className="text-md font-bold flex">CAB 
              <p className="text-orange-400">IN</p><p>D</p><p className="text-green-400"> IA</p>
            </span>
            </Link>
              <div className="md:flex justify-between w-96 ml-16 hidden ">
                {navItems.map((item : any, index) => (
                  <NavItem item={item} index={index} active={active} toggleMenu={()=>{}} />
                ))}
            </div>
          </div>
        </div>
        {
          true && (
            <div className=" w-[150px] h-16 md:flex hidden justify-center items-center ml-12" onClick={toggleProfile}>
            <div className="h-16 flex items-center justify-center mr-3">
              UserName
            </div>
            <div className="h-12 w-12 flex items-center justify-center rounded-full overflow-hidden bg-slate-200">
              <img className="" src="logo.png" alt="" />
            </div>
          </div>
          )
        }
      
      </div>
    </div>
    </>
  );
};

export default Header;
