import React, { useEffect, useRef, useState } from "react";

const RightAboutUs = () => {
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
      className={`flex flex-col md:flex-row-reverse items-center bg-white py-12 px-6 md:px-16 transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="md:w-1/2 mb-6 md:mb-0">
        <img
          src="/images/chooseus.jpg"
          alt="Captain"
          className="rounded-xl shadow-xl w-full h-auto"
        />
      </div>
      <div className="md:w-1/2 md:pr-10 text-center md:text-left">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Choose Us</h2>
        <p className="text-gray-600 leading-relaxed text-lg">
          We go beyond transportation. Every FastRide captain is verified and trained to ensure
          your comfort and safety. Affordable fares, digital payments, and fast support – all in one app.
        </p>
      </div>
    </div>
  );
};

export default RightAboutUs;
