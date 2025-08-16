import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const RideConfirmed = () => {
  const location = useLocation();
  const { driver, source, destination } = location.state || {};

  const [showPopup, setShowPopup] = useState(false);

  const handleCancel = () => {
    // Handle ride cancellation logic here (navigate or update state)
    alert("Ride cancelled successfully!");
    setShowPopup(false);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6 relative">
      <h2 className="text-xl font-semibold">
        Your captain is arriving in {driver?.eta} mins
      </h2>

      <div className="bg-gray-100 p-4 rounded-lg shadow flex justify-between items-center">
        <div>
          <p className="font-bold text-lg">{driver?.vehicle}</p>
          <p className="text-gray-600">{driver?.name}</p>
          <button className="mt-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
            📞 Call Captain
          </button>
        </div>
        <div className="text-center">
          <img
            src={driver?.photo}
            alt="Driver"
            className="w-14 h-14 rounded-full mb-1"
          />
          <p className="text-sm">⭐ {driver?.rating}</p>
        </div>
      </div>

      <div className="bg-white shadow p-4 rounded-lg">
        <p className="text-green-600 font-medium">Pickup</p>
        <p className="text-gray-800">{source}</p>

        <p className="mt-3 text-red-600 font-medium">Drop</p>
        <p className="text-gray-800">{destination}</p>
      </div>

      <button
        onClick={() => setShowPopup(true)}
        className="w-full py-2 border border-red-600 text-red-600 rounded-full hover:bg-red-100"
      >
        Cancel Ride
      </button>

      {/* Slide-down popup */}
      {showPopup && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-start bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-md shadow-md mt-20 w-11/12 max-w-md p-6 animate-slide-down">
            <p className="text-lg font-semibold text-center mb-4">
              Are you sure you want to cancel the ride?
            </p>
            <div className="flex justify-around">
              <button
                onClick={handleCancel}
                className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700"
              >
                Yes
              </button>
              <button
                onClick={() => setShowPopup(false)}
                className="border border-gray-500 text-gray-700 px-6 py-2 rounded-full hover:bg-gray-100"
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

export default RideConfirmed;
