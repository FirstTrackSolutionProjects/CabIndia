import React from "react";
import { Routes, Route } from "react-router-dom";
import Welcome from "./Components/Welcome";
import Header from "./Components/Header";
import SideBar from "./Components/SideBar";
import Footer from "./Components/Footer";


import Login from "./Pages/Login";
import CustomerRegister from "./Pages/CustomerRegister";


import AboutUs from "./Pages/AboutUs";
import JoinCaptainForm from "./Pages/JoinCaptainForm";
import ContactUs from "./Pages/ContactUs";
import FareDetails from "./Pages/FareDetails";
import FAQ from "./Pages/FAQ";
import Terms from "./Pages/Terms";
import Cancel from "./Pages/Cancel";
import Privacy from "./Pages/Privacy";
import Safety from "./Pages/Safety";
import Career from "./Pages/Career";
import Blog from "./Pages/Blog";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <>
      <Header toggleSidebar={() => setIsSidebarOpen(true)} />
      <SideBar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
      
      <Routes>
        <Route path="/" element={<Welcome />} />
      
         <Route path="/login" element={<Login />} />
         <Route path="/register/customer" element={<CustomerRegister />} />
        <Route path="/register/join-captain-form" element={<JoinCaptainForm />} />
       
      
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/join-captain-form" element={<JoinCaptainForm/>} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/fare" element={<FareDetails />} />
        <Route path="/faq" element={<FAQ/>} />
        <Route path="/terms" element={<Terms/>} />
        <Route path="/cancel" element={<Cancel/>} />
        <Route path="/privacy" element={<Privacy/>} />
        <Route path="/safety" element={<Safety/>} />
        <Route path="/career" element={<Career/>} />
        <Route path="/blog" element={<Blog/>} />

      </Routes>

      <Footer />
    </>
  );
}

export default App;
