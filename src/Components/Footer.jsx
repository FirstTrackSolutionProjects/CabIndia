
import { Link } from "react-router-dom"
import SubFooter from "./SubFooter"
const Footer = () => {
  return (
    <>
        <SubFooter />
        
      {/* Left Section: Logo + Links */}  
    <div className="flex md:flex-row flex-col  w-full bg-gray-950 text-white   items-center">
      <div className="flex sm:flex-row flex-col md:w-2/3 w-full items-center justify-center">
      <div className="flex justify-center items-center md:w-1/2 w-full  p-6 flex-col">
          <img src="logo.png" alt="" className="lg:h-40 h-48 sm:h-32" />
          <div className="text-center lg:text-5xl text-3xl font-bold flex">CAB<p className="text-orange-400">IN</p><p>D</p><p className="text-green-400"> IA</p></div>
      </div>
      <div className="flex flex-col  md:w-1/2 w-full  items-center justify-center md:p-8 p-4 border-x-2 border-gray-700">
        <div className="lg:text-2xl text-xl font-bold mb-4">
          IMPORTANT LINKS
        </div>
        <div className="flex flex-col lg:text-md text-sm">
          <Link to="/aboutus">About Us</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/FAQ">FAQ</Link>
          <Link to="/tnc">Terms & Conditions</Link>
          <Link to="/career">Work with Us</Link>
          <Link to="/cancelandrefund">Cancellation & Refund Policy</Link>
          <Link to="/privacypolicy">Privacy Policy</Link>
          </div>
        </div>
        </div>
        <div className="flex flex-col  md:w-1/3 w-full justify-center items-center md:p-8 p-4">
          <div className="lg:text-2xl text-xl font-bold mb-10 ">
            DOWNLOAD THE APP
          </div>
         <div className="md:block flex flex-col sm:flex-row md:flex-col">
            <img src="playstore.png" className="h-16 mb-10 md:mx-0 mx-2"/>
            <img src="appstore.png" className="h-16 md:mx-0 mx-2"/>
            </div>
        </div>
    </div>

    </>
  )
}

export default Footer

// import React from "react";
// import { Link } from "react-router-dom";

// const Footer = () => {
//   return (
//     <footer className="bg-white border-t pt-10 pb-6 text-sm text-gray-800">
//       <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
//         {/* Logo & Left Links */}
//         <div>
//           <div className="flex items-center space-x-2 mb-6">
//             <div className="bg-yellow-400 px-4 py-2 rounded-full text-black font-bold text-xl">
//               rapido
//             </div>
//           </div>
//           <ul className="space-y-2">
//             <li><Link to="/" className="hover:underline">Home</Link></li>
//             <li><Link to="/about" className="hover:underline">About Us</Link></li>
//             <li><Link to="/career" className="hover:underline">Careers</Link></li>
//             <li><Link to="/safety" className="hover:underline">Safety</Link></li>
//             <li><Link to="/blog" className="hover:underline">Blog</Link></li>
//             <li><Link to="/press" className="hover:underline">Press</Link></li>
//             <li><Link to="/privacy-policy" className="hover:underline">Privacy Policy</Link></li>
//           </ul>
//         </div>

//         {/* Right Column Links */}
//         <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
//           <ul className="space-y-2">
//             <li><Link to="/terms/customer-bike" className="hover:underline">Customer Terms - Bike Taxi</Link></li>
//             <li><Link to="/terms/customer-cabs" className="hover:underline">Customer Terms - Cabs and Auto</Link></li>
//             <li><Link to="/corporate" className="hover:underline">Corporate Affairs</Link></li>
//           </ul>
//           <ul className="space-y-2">
//             <li><Link to="/terms/captain-bike" className="hover:underline">Captain Terms - Bike Taxi</Link></li>
//             <li><Link to="/terms/captain-cabs" className="hover:underline">Captain Terms - Cabs and Auto</Link></li>
//           </ul>
//         </div>
//       </div>

//       {/* Bottom Copyright */}
//       <div className="mt-10 border-t pt-4 text-center text-gray-500 text-xs">
//          Copyright @ 2025, Developed by &nbsp; <p><a href="https://firsttracksolution.tech">First Track Solution Technologies</a></p>
//       </div>
//     </footer>
//   );
// };

// export default Footer;
