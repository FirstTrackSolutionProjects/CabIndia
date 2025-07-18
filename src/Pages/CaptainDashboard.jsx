import React from "react";
import RideCard from "../Components/RideCard";

const requests = [
  { pickup: "Saket", drop: "Lajpat", vehicle: "Bike", status: "Pending", date: "2025-07-15" },
  { pickup: "Noida", drop: "Kalkaji", vehicle: "Bike", status: "Accepted", date: "2025-07-14" },
];

const CaptainDashboard = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Ride Requests</h2>
      <div className="space-y-4">
        {requests.map((ride, i) => (
          <RideCard key={i} ride={ride} />
        ))}
      </div>
    </div>
  );
};

export default CaptainDashboard;
