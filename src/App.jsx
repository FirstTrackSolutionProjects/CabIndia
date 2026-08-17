// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import Welcome from "./Components/Welcome";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import BottomNav from "./Components/BottomNav";
import ServiceSection from "./Components/ServiceSection";
import Contact from "./Components/Contact";
import CabIndiaChat from "./Components/CabIndiaChat";

// Pages
import Login from "./Pages/Login";
import RiderLogin from "./Pages/RiderLogin";
import CustomerRegister from "./Pages/CustomerRegister";
import JoinCaptainForm from "./Pages/JoinCaptainForm";
import AboutUs from "./Pages/AboutUs";
import FareDetails from "./Pages/FareDetails";
import FAQ from "./Pages/FAQ";
import Terms from "./Pages/Terms";
import Cancel from "./Pages/Cancel";
import Privacy from "./Pages/Privacy";
import Safety from "./Pages/Safety";
import Blog from "./Pages/Blog";
import UserDashboard from "./Pages/UserDashboard";
import RideSearching from "./Pages/RideSearching";
import RideConfirmed from "./Pages/RideConfirmed";

// Admin Pages
import AdminLogin from "./Pages/Admin/AdminLogin";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import AdminUsers from "./Pages/Admin/AdminUsers";
import AdminCaptains from "./Pages/Admin/AdminCaptains";
import AdminRides from "./Pages/Admin/AdminRides";
import AdminSupport from "./Pages/Admin/AdminSupport";

// Captain Pages
import CaptainDashboard from "./Pages/Captain/CaptainDashboard";
import CaptainRideRequests from "./Pages/Captain/CaptainRideRequests";
import CaptainRideHistory from "./Pages/Captain/CaptainRideHistory";
import CaptainEarnings from "./Pages/Captain/CaptainEarnings";
import CaptainProfile from "./Pages/Captain/CaptainProfile";
import CaptainMap from "./Pages/Captain/CaptainMap";

// Context & Utils
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./Components/PrivateRoute";
import ForgotPassword from './Pages/ForgotPassword';
import CustomerProfile from './Pages/CustomerProfile';

function App() {
  const hideFooterRoutes = ["/fare", "/ride-searching", "/ride-confirmed"];

  const ShouldHideFooter = ({ children }) => {
    const location = window.location.pathname;
    if (hideFooterRoutes.includes(location.toLowerCase())) {
      return null;
    }
    return children;
  };

  return (
    <AuthProvider>
      <ToastContainer position="bottom-center" theme="dark" />
      <Header />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/rider" element={<RiderLogin />} />
        <Route path="/register/customer" element={<CustomerRegister />} />
        <Route path="/register/join-captain-form" element={<JoinCaptainForm />} />
        <Route path="/service" element={<ServiceSection />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/fare" element={<FareDetails />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cancel" element={<Cancel />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/chat" element={<CabIndiaChat />} />

        {/* Customer Protected Routes */}
        <Route path="/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
        <Route path="/ride-searching" element={<PrivateRoute><RideSearching /></PrivateRoute>} />
        <Route path="/ride-confirmed" element={<PrivateRoute><RideConfirmed /></PrivateRoute>} />

        {/* Captain Protected Routes */}
        <Route path="/captain/dashboard" element={<PrivateRoute captainOnly><CaptainDashboard /></PrivateRoute>} />
        <Route path="/captain/requests" element={<PrivateRoute captainOnly><CaptainRideRequests /></PrivateRoute>} />
        <Route path="/captain/history" element={<PrivateRoute captainOnly><CaptainRideHistory /></PrivateRoute>} />
        <Route path="/captain/earnings" element={<PrivateRoute captainOnly><CaptainEarnings /></PrivateRoute>} />
        <Route path="/captain/profile" element={<PrivateRoute captainOnly><CaptainProfile /></PrivateRoute>} />
        <Route path="/captain/map" element={<PrivateRoute captainOnly><CaptainMap /></PrivateRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/users" element={<PrivateRoute adminOnly><AdminUsers /></PrivateRoute>} />
        <Route path="/admin/captains" element={<PrivateRoute adminOnly><AdminCaptains /></PrivateRoute>} />
        <Route path="/admin/rides" element={<PrivateRoute adminOnly><AdminRides /></PrivateRoute>} />
        <Route path="/admin/support" element={<PrivateRoute adminOnly><AdminSupport /></PrivateRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<PrivateRoute><CustomerProfile /></PrivateRoute>} />
      </Routes>
      <ShouldHideFooter>
        <BottomNav />
        <Footer />
      </ShouldHideFooter>
    </AuthProvider>
  );
}

export default App;