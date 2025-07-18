import React from "react";

const RideStatus = ({ status }) => {
  return (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded text-center text-sm">
      <p className="text-yellow-700 font-medium">
        Ride Status: {status}
      </p>
    </div>
  );
};

export default RideStatus;
