import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const RideSearching = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { ride, icon, source, destination } = location.state || {};

  const [progress, setProgress] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            navigate("/ride-confirmed", {
              state: {
                driver: {
                  name: "Sarata Muduli",
                  rating: 4.4,
                  photo: "/driver.png",
                  vehicle: "OD02AY9553",
                  eta: 6,
                },
                source,
                destination,
              },
            });
          }, 500);
        }
        return Math.min(prev + 2, 100);
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4 relative">
      <div className="text-6xl mb-4">{icon}</div>
      <h2 className="text-gray-600 mb-1">Looking for your</h2>
      <h1 className="text-2xl font-bold">{ride} ride</h1>

      <div className="w-full max-w-md mt-6">
        <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-200"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <button
        onClick={() => setShowPopup(true)}
        className="mt-10 text-red-600 border border-red-500 px-6 py-2 rounded-full hover:bg-red-100 transition"
      >
        Cancel ride
      </button>

      {showPopup && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <p className="text-lg font-medium mb-4">Do you want to cancel this ride?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Yes, Cancel
              </button>
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideSearching;
