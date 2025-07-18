import React from "react";
import RideCard from "../Components/RideCard";

const rides = [
  { pickup: "Delhi", drop: "Noida", vehicle: "Bike", status: "Completed", date: "2025-07-01" },
  { pickup: "Gurgaon", drop: "CP", vehicle: "Auto", status: "Ongoing", date: "2025-07-15" },
];

const UserDashboard = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Your Rides</h2>
      <div className="space-y-4">
        {rides.map((ride, i) => (
          <RideCard key={i} ride={ride} />
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;
