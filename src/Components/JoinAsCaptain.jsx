import React from "react";
import { useNavigate } from "react-router-dom";

const JoinAsCaptain = () => {
  const navigate = useNavigate();

  const handleJoin = () => {
    navigate("/join-captain-form"); // replace with your actual route
  };

  return (
    <section className="bg-yellow-100 py-16 px-6 md:px-20">
      <div className="flex flex-col md:flex-row items-center gap-12">
        {/* Text Section */}
        <div className="md:w-1/2">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Join as a Captain
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            Become a part of India’s fastest-growing ride-sharing network and earn on your own terms.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>Flexible working hours</li>
            <li>Weekly payouts</li>
            <li>Attractive incentives</li>
            <li>24/7 support team</li>
          </ul>
          <button
            onClick={handleJoin}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-3 rounded-lg shadow"
          >
            Join Now
          </button>
        </div>

        {/* Image Section */}
        <div className="md:w-1/2 flex justify-center">
          <img
            src="/images/join-captain.jpg"
            alt="Join as Captain"
            className="w-full max-w-sm rounded-xl shadow-xl"
          />
        </div>
      </div>
    </section>
  );
};

export default JoinAsCaptain;
