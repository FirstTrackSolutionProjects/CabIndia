import React, { useEffect }  from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Welcome from "./Components/Welcome";
import Header from "./Components/Header";
// import SideBar from "./Components/SideBar";
import Footer from "./Components/Footer";


import Login from "./Pages/Login";
import RiderLogin from "./Pages/RiderLogin";
import CustomerRegister from "./Pages/CustomerRegister";


import AboutUs from "./Pages/AboutUs";
import JoinCaptainForm from "./Pages/JoinCaptainForm";
import Contact from "./Components/Contact";
import FareDetails from "./Pages/FareDetails";
import RideSearching from "./Pages/RideSearching";
import RideConfirmed from "./Pages/RideConfirmed";
import FAQ from "./Pages/FAQ";
import Terms from "./Pages/Terms";
import Cancel from "./Pages/Cancel";
import Privacy from "./Pages/Privacy";
import Safety from "./Pages/Safety";
// import Career from "./Pages/Career";
import Blog from "./Pages/Blog";

function App() {
  //  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const location = useLocation();

    useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

 
  const hideFooterRoutes = ["/fare", "/"];

  const shouldHideFooter = hideFooterRoutes.includes(location.pathname.toLowerCase());

  return (
    <>
   
      <Header />
      {/* <SideBar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
       */}
      <Routes>
        <Route path="/" element={<Welcome />} />
      
         <Route path="/login" element={<Login />} />
        <Route path="/rider" element={<RiderLogin />} />
         <Route path="/register/customer" element={<CustomerRegister />} />
        <Route path="/register/join-captain-form" element={<JoinCaptainForm />} />
       
      
        <Route path="/about" element={<AboutUs />} />
        <Route path="/join-captain-form" element={<JoinCaptainForm/>} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/fare" element={<FareDetails />} />
        <Route path="/ride-searching" element={<RideSearching />} />
        <Route path="/ride-confirmed" element={<RideConfirmed />} />
        <Route path="/faq" element={<FAQ/>} />
        <Route path="/terms" element={<Terms/>} />
        <Route path="/cancel" element={<Cancel/>} />
        <Route path="/privacy" element={<Privacy/>} />
        <Route path="/safety" element={<Safety/>} />
        {/* <Route path="/career" element={<Career/>} /> */}
        <Route path="/blog" element={<Blog/>} />

      </Routes>
          

      {!shouldHideFooter && <Footer />}
    </>
  );
}

export default App;
