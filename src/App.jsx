// import Index from "./Pages/Index";
// import { Routes, Route } from "react-router-dom";
// import AboutUs from "./Pages/AboutUs";
// import Dashboard from "./Pages/Dashboard";
// import Career from "./Pages/Career";
// import ContactUs from "./Pages/ContactUs";
// import CabServices from "./Pages/CabServices";
// import RiderDash from "./Pages/RiderDash";
// import Header from "./Components/Header";
// import Footer from "./Components/Footer";


// const App = () => {
//   return (
//     <>
//       <Header width='full' active="Home" />
//       <Routes>
       
       
//         <Route index element={<Index/>} />
//         <Route path="/blog" element={<AboutUs/>} />
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="/career" element={<Career/>} />
//         <Route path="/contact" element={<ContactUs/>} />
//         <Route path="/cabs" element={<CabServices/>} />
//         <Route path="/RiderDash" element={<RiderDash/>} />
//         <Route path="*" element={<AboutUs/>} />
//       </Routes>
//       <Footer />
//     </>
//   );
// };

// export default App;

import React from "react";
import { Routes, Route } from "react-router-dom";
import Welcome from "./Components/Welcome";
import Header from "./Components/Header";
import SideBar from "./Components/SideBar";
import Footer from "./Components/Footer";
import BookRide from "./Pages/BookRide";
import CaptainJoin from "./Pages/CaptainJoin";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import UserDashboard from "./Pages/UserDashboard";
import CaptainDashboard from "./Pages/CaptainDashboard";
import AboutUs from "./Pages/AboutUs";
import ContactUs from "./Pages/ContactUs";
import FareDetails from "./Pages/FareDetails";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <>
      <Header toggleSidebar={() => setIsSidebarOpen(true)} />
      <SideBar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
      
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/book" element={<BookRide />} />
        <Route path="/captain" element={<CaptainJoin />} />
         <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> 
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/captain-dashboard" element={<CaptainDashboard />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/fare" element={<FareDetails />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
