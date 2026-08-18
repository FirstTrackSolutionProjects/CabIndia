// src/Pages/FareDetails.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader2, MapPin, Car, Wallet, CreditCard, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

const rideTypes = [
  { type: "Bike", icon: "🏍️", pricePerKm: 7, minFare: 30 },
  { type: "Auto", icon: "🛺", pricePerKm: 10, minFare: 40 },
  { type: "Mini", icon: "🚗", pricePerKm: 12, minFare: 60 },
  { type: "Sedan", icon: "🚙", pricePerKm: 15, minFare: 80 },
  { type: "SUV", icon: "🚐", pricePerKm: 18, minFare: 100 },
  { type: "Parcel", icon: "📦", pricePerKm: 8, minFare: 35 },
];

const paymentOptions = [
  { name: "Cash", icon: "💵", description: "Pay directly to the captain" },
  { name: "Online", icon: "💳", description: "UPI, cards or wallets" },
];

const FareDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { source, destination, sourceLat, sourceLon, destLat, destLon } = location.state || {};

  const [selectedPayment, setSelectedPayment] = useState("Cash");
  const [showOptions, setShowOptions] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const calculateDistance = async () => {
      if (!sourceLat || !sourceLon || !destLat || !destLon) {
        toast.error("Location data missing. Please try again.");
        navigate('/');
        return;
      }

      try {
        const response = await api.post('/api/rides/distance', {
          originLat: sourceLat,
          originLon: sourceLon,
          destLat: destLat,
          destLon: destLon,
        });

        if (response.data.success) {
          setDistance(response.data.distance);
        } else {
          // Fallback: Calculate using Haversine formula
          const R = 6371;
          const dLat = (destLat - sourceLat) * Math.PI / 180;
          const dLon = (destLon - sourceLon) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(sourceLat * Math.PI / 180) * Math.cos(destLat * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const dist = R * c;
          setDistance(dist);
        }
      } catch (error) {
        console.error('Distance calculation error:', error);
        // Fallback calculation
        const R = 6371;
        const dLat = (destLat - sourceLat) * Math.PI / 180;
        const dLon = (destLon - sourceLon) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(sourceLat * Math.PI / 180) * Math.cos(destLat * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const dist = R * c;
        setDistance(dist);
      } finally {
        setLoading(false);
      }
    };

    calculateDistance();
  }, [sourceLat, sourceLon, destLat, destLon, navigate]);

  const handleContinue = async () => {
    if (!selectedRide) {
      toast.error("Please select a ride type first.");
      return;
    }

    if (!user) {
      toast.error("Please login to book a ride.");
      navigate('/login');
      return;
    }

    setBookingLoading(true);

    const minFare = Math.max(selectedRide.minFare, selectedRide.pricePerKm * distance);
    const maxFare = Math.ceil(minFare * 1.2);
    const estimatedFareStr = `${Math.floor(minFare)} - ${maxFare}`;

    try {
      const response = await api.post('/api/rides/request', {
        pickupAddress: source,
        dropoffAddress: destination,
        vehicleType: selectedRide.type,
        pickupLat: sourceLat,
        pickupLon: sourceLon,
        dropoffLat: destLat,
        dropoffLon: destLon,
        estimatedPrice: estimatedFareStr,
        distanceKm: distance.toFixed(1),
        paymentMethod: selectedPayment,
      });

      if (response.data.success) {
        toast.success('Ride requested successfully!');
        navigate('/ride-searching', {
          state: {
            rideId: response.data.rideId,
            ride: selectedRide.type,
            icon: selectedRide.icon,
            source,
            destination,
            estimatedFare: estimatedFareStr,
            pickupLat: sourceLat,
            pickupLon: sourceLon,
            dropoffLat: destLat,
            dropoffLon: destLon,
            paymentMethod: selectedPayment,
            distance: distance.toFixed(1)
          }
        });
      } else {
        toast.error(response.data.message || 'Failed to request ride.');
      }
    } catch (error) {
      console.error('Ride Request Error:', error);
      toast.error(error.response?.data?.message || 'Failed to request ride. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-yellow-400" size={48} />
          <p className="text-gray-400">Calculating distance...</p>
        </div>
      </div>
    );
  }

  const selected = paymentOptions.find(p => p.name === selectedPayment);

  return (
    <div className="min-h-screen bg-gray-950 text-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Fare Details</h1>

        {/* Location Details */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-3 mb-3">
            <MapPin className="text-green-400 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-400">From</p>
              <p className="font-semibold">{source}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="text-red-400 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-400">To</p>
              <p className="font-semibold">{destination}</p>
            </div>
          </div>
          {distance && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              <p className="text-sm text-gray-400">
                Estimated Distance: <span className="text-yellow-400 font-bold">{distance.toFixed(1)} km</span>
              </p>
            </div>
          )}
        </div>

        {/* Ride Types */}
        <h2 className="text-xl font-bold mb-4">Select Service</h2>
        <div className="space-y-3 mb-6">
          {rideTypes.map((ride, idx) => {
            const minFare = Math.max(ride.minFare, ride.pricePerKm * distance);
            const maxFare = Math.ceil(minFare * 1.2);
            const isSelected = selectedRide?.type === ride.type;

            return (
              <div
                key={idx}
                onClick={() => setSelectedRide(ride)}
                className={`flex justify-between items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-yellow-400 bg-yellow-400/10' 
                    : 'border-gray-800 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{ride.icon}</span>
                  <span className="font-medium">{ride.type}</span>
                </div>
                <span className="font-bold text-yellow-400">
                  ₹{Math.floor(minFare)} - ₹{maxFare}
                </span>
              </div>
            );
          })}
        </div>

        {/* Payment Method */}
        <h2 className="text-xl font-bold mb-4">Payment Method</h2>
        <div className="relative mb-6">
          <div
            className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:border-gray-600 transition-all"
            onClick={() => setShowOptions(!showOptions)}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selected.icon}</span>
              <div>
                <p className="font-semibold">{selected.name}</p>
                <p className="text-sm text-gray-400">{selected.description}</p>
              </div>
            </div>
            {showOptions ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>

          {showOptions && (
            <div className="absolute z-10 mt-2 w-full bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
              {paymentOptions.map((method) => (
                <div
                  key={method.name}
                  onClick={() => {
                    setSelectedPayment(method.name);
                    setShowOptions(false);
                  }}
                  className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-800 transition-all ${
                    selectedPayment === method.name ? 'bg-yellow-400/10 border-l-4 border-yellow-400' : ''
                  }`}
                >
                  <span className="text-2xl">{method.icon}</span>
                  <div>
                    <p className="font-semibold">{method.name}</p>
                    <p className="text-sm text-gray-400">{method.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={bookingLoading || !selectedRide}
          className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
        >
          {bookingLoading ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <>
              Continue Booking <ArrowRight size={20} />
            </>
          )}
        </button>

        {!user && (
          <p className="text-center text-sm text-gray-400 mt-4">
            Please <button onClick={() => navigate('/login')} className="text-yellow-400 hover:underline">login</button> to book a ride
          </p>
        )}
      </div>
    </div>
  );
};

export default FareDetails;