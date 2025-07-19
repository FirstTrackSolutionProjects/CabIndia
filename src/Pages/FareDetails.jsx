import React from 'react';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';

const FareDetails = () => {
  const location = useLocation();
  const { source, destination } = location.state || {};

    const [selectedPayment, setSelectedPayment] = useState("Cash");
  // Dummy logic: price per km
  const rideTypes = [
    { type: "Bike", icon: "🏍️", pricePerKm: 7 },
    { type: "Auto", icon: "🛺", pricePerKm: 10 },
    { type: "Cab Economy", icon: "🚕", pricePerKm: 12 },
    { type: "Cab Premium", icon: "🚖", pricePerKm: 15 },
  ];

  // Fake distance function (can be replaced with real API)
  const getDistanceKm = () => {
    if (!source || !destination) return 0;
    if (source === destination) return 1;
    return Math.floor(Math.random() * 10) + 2; // 2-11 km fake
  };

  const distance = getDistanceKm();

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="bg-gray-100 p-4 rounded-lg shadow mb-4">
        <p className="text-sm text-gray-600 font-medium">From</p>
        <p className="text-lg font-semibold">{source}</p>
        <p className="text-sm text-gray-600 font-medium mt-2">To</p>
        <p className="text-lg font-semibold">{destination}</p>
        <p className="text-sm mt-2 text-gray-500">Estimated Distance: <strong>{distance} km</strong></p>
      </div>

      <h2 className="text-xl font-semibold mb-4">Select service</h2>
      <div className="space-y-4">
        {rideTypes.map((ride, idx) => {
          const minFare = ride.pricePerKm * distance;
          const maxFare = Math.ceil(minFare * 1.2);
          return (
            <div key={idx} className="flex justify-between items-center p-4 border rounded cursor-pointer hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ride.icon}</span>
                <span className="font-medium">{ride.type}</span>
              </div>
              <span className="font-semibold">₹ {minFare} - ₹ {maxFare}</span>
            </div>
          );
        })}
      </div>

       {/* Payment Mode */}
      <div className="mt-6">
        <h3 className="font-medium mb-2">Select Payment Method</h3>
        <div className="flex gap-4">
          {["Cash", "Online"].map((method) => (
            <button
              key={method}
              onClick={() => setSelectedPayment(method)}
              className={`py-2 px-4 rounded border font-semibold transition ${
                selectedPayment === method
                  ? "bg-yellow-500 text-white border-yellow-500"
                  : "bg-white text-gray-700 border-gray-300 hover:border-yellow-500"
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>
        
          <div className="mt-6 flex justify-end">
        <button className="bg-yellow-500 text-white py-2 px-4 rounded font-semibold hover:bg-yellow-600">
          Continue Booking
        </button>
      </div>
    </div>
  );
};

export default FareDetails;
