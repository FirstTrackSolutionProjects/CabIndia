import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const FareDetails = () => {
  const location = useLocation();
  const { source, destination } = location.state || {};

  const [selectedPayment, setSelectedPayment] = useState("Cash");
  const [showOptions, setShowOptions] = useState(false);

  const rideTypes = [
    { type: "Bike", icon: "🏍️", pricePerKm: 7 },
    { type: "Auto", icon: "🛺", pricePerKm: 10 },
    { type: "Cab Economy", icon: "🚕", pricePerKm: 12 },
    { type: "Cab Premium", icon: "🚖", pricePerKm: 15 },
  ];

  const getDistanceKm = () => {
    if (!source || !destination) return 0;
    if (source === destination) return 1;
    return Math.floor(Math.random() * 10) + 2; // 2-11 km fake
  };

  const distance = getDistanceKm();

  const paymentOptions = [
    { name: "Cash", icon: "💵", description: "Pay directly to the captain" },
    { name: "Online", icon: "💳", description: "UPI, cards or wallets" },
  ];

  const selected = paymentOptions.find(p => p.name === selectedPayment);

  return (
    <div className="p-6 max-w-xl mx-auto">
      {/* From/To Details */}
      <div className="bg-gray-100 p-4 rounded-lg shadow mb-4">
        <p className="text-sm text-gray-600 font-medium">From</p>
        <p className="text-lg font-semibold">{source}</p>
        <p className="text-sm text-gray-600 font-medium mt-2">To</p>
        <p className="text-lg font-semibold">{destination}</p>
        <p className="text-sm mt-2 text-gray-500">Estimated Distance: <strong>{distance} km</strong></p>
      </div>

      {/* Ride Type Cards */}
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

      {/* Payment Method Dropdown */}
      <div className="relative mt-6 max-w-sm">
        <h3 className="font-medium mb-2 text-lg">Select Payment Method</h3>

        {/* Selected */}
        <div
          className="border rounded-lg px-3 py-1 flex items-center justify-between cursor-pointer bg-white hover:shadow-md"
          onClick={() => setShowOptions(!showOptions)}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{selected.icon}</span>
            <div>
              <p className="font-semibold">{selected.name}</p>
              <p className="text-sm text-gray-500">{selected.description}</p>
            </div>
          </div>
          <span className="text-gray-500">{showOptions ? "▲" : "▼"}</span>
        </div>

        {/* Options */}
        {showOptions && (
          <div className="absolute z-10 mt-2 w-full border rounded-lg bg-white shadow-lg">
            {paymentOptions.map((method) => (
              <div
                key={method.name}
                onClick={() => {
                  setSelectedPayment(method.name);
                  setShowOptions(false);
                }}
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-yellow-50 ${
                  selectedPayment === method.name ? "bg-yellow-100" : ""
                }`}
              >
                <span className="text-xl">{method.icon}</span>
                <div>
                  <p className="font-semibold">{method.name}</p>
                  <p className="text-sm text-gray-500">{method.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Continue Button */}
      <div className="mt-6 flex justify-end">
        <button className="bg-yellow-500 text-white py-2 px-4 rounded font-semibold hover:bg-yellow-600">
          Continue Booking
        </button>
      </div>
    </div>
  );
};

export default FareDetails;
