// src/Components/Welcome.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoadScript } from "@react-google-maps/api";
import ServiceSection from "./ServiceSection";
import CabIndiaChat from "./CabIndiaChat";
import LocationInput from "../Components/LocationInput";
import { toast } from "react-toastify";
import { Loader2, ArrowRight, MapPin } from "lucide-react";

const libraries = ['places'];

const Welcome = () => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [sourceCoords, setSourceCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAD7ImoIAlAk6Ob9Iwyd_67UFr9lCNVTNY',
    libraries,
  });

  const handleSourceSelect = (address, lat, lng) => {
    setSource(address);
    setSourceCoords({ lat, lng });
  };

  const handleDestSelect = (address, lat, lng) => {
    setDestination(address);
    setDestCoords({ lat, lng });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!source || !destination) {
      toast.error("Please enter both pickup and drop-off locations");
      return;
    }

    if (!sourceCoords || !destCoords) {
      toast.error("Please select a valid location from the suggestions");
      return;
    }

    setLoading(true);
    
    // Navigate directly with coordinates
    navigate("/fare", {
      state: { 
        source, 
        destination,
        sourceLat: sourceCoords.lat,
        sourceLon: sourceCoords.lng,
        destLat: destCoords.lat,
        destLon: destCoords.lng
      },
    });
    
    setLoading(false);
  };

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">Error loading Google Maps</p>
          <p className="text-gray-500 text-sm mt-2">Please check your API key</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-yellow-400" size={48} />
      </div>
    );
  }

  return (
    <div className="bg-gray-950 min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/images/about-ride.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/80 via-gray-950/60 to-gray-950" />
        
        <div className="relative z-10 flex min-h-[calc(100vh-200px)] items-center justify-center px-4">
          <div className="max-w-5xl w-full">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-4 py-1.5 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                <span className="text-yellow-400 text-xs font-medium tracking-wider uppercase">
                  India's Trusted Ride Platform
                </span>
              </div>

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

              {/* Search Form with Autocomplete */}
              <form
                onSubmit={handleSubmit}
                className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-3xl mx-auto"
              >
                <div className="w-full sm:flex-1 relative">
                  <LocationInput
                    placeholder="Pickup Location"
                    value={source}
                    onChange={setSource}
                    onSelect={handleSourceSelect}
                    icon={MapPin}
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
                  <LocationInput
                    placeholder="Drop-off Location"
                    value={destination}
                    onChange={setDestination}
                    onSelect={handleDestSelect}
                    icon={MapPin}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !sourceCoords || !destCoords}
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

      <ServiceSection />
      <CabIndiaChat />
    </div>
  );
};

export default Welcome;