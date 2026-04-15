import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ServiceSection from "./ServiceSection";

const Welcome = () => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!source || !destination) {
      alert("Please enter both source and destination");
      return;
    }

    navigate("/fare", {
      state: { source, destination },
    });
  };

  return (
    <div className="bg-gray-900 ">

      {/* ✅ LANDING SECTION */}
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex-col text-white w-full flex items-center justify-center px-5">
          <div className="flex justify-center items-center flex-col">
            
            <p className="text-center md:text-6xl text-5xl font-extrabold sm:block flex flex-col items-center">
              GET YOUR <span className="text-yellow-400">FIRST RIDE</span> NOW
            </p>

            <p className="text-center md:text-xl text-sm sm:mt-5 mt-10 text-white">
              AUTO • BIKES • CARS
            </p>

            <form
              onSubmit={handleSubmit}
              className="flex md:flex-row flex-col w-full items-center justify-center gap-4 mt-16"
            >
              <input
                type="text"
                placeholder="Source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="md:w-60 w-full h-10 rounded-xl p-2 text-black font-bold bg-white"
              />

              <div className="flex justify-center items-center w-10 h-10 text-xl text-white">
                • • •
              </div>

              <input
                type="text"
                placeholder="Destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="md:w-60 w-full h-10 rounded-xl p-2 text-black font-bold bg-white"
              />

              <button
                type="submit"
                className="w-36 h-10 bg-yellow-400 hover:bg-yellow-500 rounded-xl text-black font-bold transition-all"
              >
                Get Your Fare
              </button>
            </form>

          </div>
        </div>
      </div>

      
      <ServiceSection />

    </div>
  );
};

export default Welcome;