import { Link } from "react-router-dom";
import SubFooter from "./SubFooter";

const Footer = () => {
  return (
    <>
      <SubFooter />

      <div className="w-full bg-gray-950 text-white flex flex-col items-center">
        {/* Main Footer Content */}
        <div className="flex md:flex-row flex-col w-full items-center">
          {/* Left Section: Logo */}
          <div className="flex sm:flex-row flex-col md:w-2/3 w-full items-center justify-center">
            <div className="flex justify-center items-center md:w-1/2 w-full p-6 flex-col">
              <img src="logo.png" alt="Logo" className="lg:h-40 h-48 sm:h-32" />
              <div className="text-center lg:text-5xl text-3xl font-bold flex">
                CAB<p className="text-orange-400">IN</p><p>D</p><p className="text-green-400">IA</p>
              </div>
            </div>

            {/* Important Links */}
            <div className="flex flex-col md:w-1/2 w-full items-center justify-center md:p-8 p-4 border-x-2 border-gray-700">
              <div className="lg:text-2xl text-xl font-bold mb-4">IMPORTANT LINKS</div>
              <div className="flex flex-col lg:text-md text-sm">
                <Link to="/aboutus">About Us</Link>
                <Link to="/contact">Contact Us</Link>
                <Link to="/FAQ">FAQ</Link>
                <Link to="/terms">Terms & Conditions</Link>
                <Link to="/career">Work with Us</Link>
                <Link to="/cancel">Cancellation & Refund Policy</Link>
                <Link to="/privacy">Privacy Policy</Link>
                <Link to="/safety">Safety</Link>
              </div>
            </div>
          </div>

          {/* Right Section: App Download */}
          <div className="flex flex-col md:w-1/3 w-full justify-center items-center md:p-8 p-4">
            <div className="lg:text-2xl text-xl font-bold mb-10">DOWNLOAD THE APP</div>
            <div className="md:block flex flex-col sm:flex-row md:flex-col">
              <img src="playstore.png" className="h-16 mb-10 md:mx-0 mx-2" alt="Playstore" />
              <img src="appstore.png" className="h-16 md:mx-0 mx-2" alt="Appstore" />
            </div>
          </div>
        </div>
        <hr/>

        {/* Copyright Section */}
        
        <div className="mt-6 text-l bg-black text-center">
          Copyright &copy; 2025, Developed by CabIndia
        </div>
      </div>
    </>
  );
};

export default Footer;
