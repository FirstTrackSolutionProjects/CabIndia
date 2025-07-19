import React, { useEffect, useRef, useState } from "react";

const LeftAboutUs = () => {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      className={`flex flex-col md:flex-row items-center bg-white py-12 px-6 md:px-16 transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="md:w-1/2 mb-6 md:mb-0">
        <img
          src="/images/about-ride.jpg"
          alt="About Ride"
          className="rounded-xl shadow-xl w-full h-auto"
        />
      </div>
      <div className="md:w-1/2 md:pl-10 text-center md:text-left">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">About FastRide</h2>
        <p className="text-gray-600 leading-relaxed text-lg">
          FastRide is your trusted everyday mobility partner. We help you reach your destination
          faster and cheaper. With real-time tracking, reliable riders, and safety-first service,
          we’ve become the city’s favorite way to move.
        </p>
      </div>
    </div>
  );
};

export default LeftAboutUs;
