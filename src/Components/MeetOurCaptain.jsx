import React from "react";

const captains = [
  {
    name: "Ravi Kumar",
    image: "/images/captain1.jpg",
    city: "Hyderabad",
    tagline: "Your safety, my priority!",
  },
  {
    name: "Anjali Verma",
    image: "/images/captain2.jpg",
    city: "Bengaluru",
    tagline: "Fast and friendly service!",
  },
  {
    name: "Amit Singh",
    image: "/images/captain3.jpg",
    city: "Mumbai",
    tagline: "Always on time, every time.",
  },
];

const MeetOurCaptains = () => {
  return (
    <div className="bg-gray-50 py-14 px-6 md:px-16">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
        Meet Our Captains
      </h2>
      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
        {captains.map((captain, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-2xl transition duration-300"
          >
            <img
              src={captain.image}
              alt={captain.name}
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
            />
            <h3 className="text-xl font-semibold text-gray-800">{captain.name}</h3>
            <p className="text-sm text-gray-500">{captain.city}</p>
            <p className="mt-3 text-yellow-600 font-medium italic">
              “{captain.tagline}”
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeetOurCaptains;
