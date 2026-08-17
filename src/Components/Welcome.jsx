// src/Components/Welcome.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ServiceSection from "./ServiceSection";
import CabIndiaChat from "./CabIndiaChat";
import { toast } from "react-toastify";
import { Loader2, ArrowRight } from "lucide-react";

const Welcome = () => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!source || !destination) {
      toast.error("Please enter both source and destination");
      return;
    }

    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAD7ImoIAlAk6Ob9Iwyd_67UFr9lCNVTNY';
      
      const sourceResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(source)}&key=${apiKey}`
      );
      const destResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${apiKey}`
      );

      const sourceData = await sourceResponse.json();
      const destData = await destResponse.json();

      if (!sourceData.results || sourceData.results.length === 0) {
        toast.error("Could not find source location. Please try again.");
        setLoading(false);
        return;
      }
      if (!destData.results || destData.results.length === 0) {
        toast.error("Could not find destination location. Please try again.");
        setLoading(false);
        return;
      }

      const sourceLat = sourceData.results[0].geometry.location.lat;
      const sourceLon = sourceData.results[0].geometry.location.lng;
      const destLat = destData.results[0].geometry.location.lat;
      const destLon = destData.results[0].geometry.location.lng;

      navigate("/fare", {
        state: { 
          source, 
          destination,
          sourceLat,
          sourceLon,
          destLat,
          destLon
        },
      });
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error("Error finding locations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-950 min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/images/about-ride.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/80 via-gray-950/60 to-gray-950" />
        
        <div className="relative z-10 flex min-h-[calc(100vh-200px)] items-center justify-center px-4">
          <div className="max-w-5xl w-full">
            <div className="text-center">
              {/* Tag */}
              <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-4 py-1.5 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                <span className="text-yellow-400 text-xs font-medium tracking-wider uppercase">
                  India's Trusted Ride Platform
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
                GET YOUR{" "}
                <span className="text-yellow-400 italic">FIRST RIDE</span>
                <br />
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-400">
                  AUTO • BIKES • CABS
                </span>
              </h1>

              <p className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto">
                Safe, reliable, and affordable rides at your fingertips. Book a cab in seconds.
              </p>

              {/* Search Form */}
              <form
                onSubmit={handleSubmit}
                className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-3xl mx-auto"
              >
                <div className="w-full sm:flex-1 relative">
                  <input
                    type="text"
                    placeholder="📍 Pickup Location"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full h-14 rounded-2xl px-5 pr-12 text-gray-900 font-medium bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg"
                    required
                  />
                </div>

                <div className="flex-shrink-0 text-gray-500 text-2xl font-light hidden sm:block">
                  →
                </div>
                <div className="flex-shrink-0 text-gray-500 text-2xl font-light block sm:hidden">
                  ↓
                </div>

                <div className="w-full sm:flex-1 relative">
                  <input
                    type="text"
                    placeholder="📍 Drop-off Location"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full h-14 rounded-2xl px-5 pr-12 text-gray-900 font-medium bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto h-14 px-8 bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-bold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/25 hover:shadow-yellow-400/40"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={22} />
                  ) : (
                    <>
                      Get Fare <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>

              {/* Trust Badges */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  50K+ Happy Riders
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  500+ Verified Captains
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  24/7 Support
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  4.8 ★ Average Rating
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <ServiceSection />
      
      {/* Chat Widget */}
      <CabIndiaChat />
    </div>
  );
};

export default Welcome;