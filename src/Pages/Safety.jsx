import React from "react";
// import customer1 from "/images/safety1.png";
// import customer2 from "/images/safety2.png";
// import customer3 from "/images/safety3.png";

const Safety = () => {
  return (
    <div className="bg-white text-black px-6 md:px-16 py-12">
      {/* Main Title Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="lg:w-1/2">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Committed to Your Safety</h1>
          <p className="text-lg leading-relaxed">
            Your trust matters. That's why we go the extra mile to ensure each journey is
            safe, secure, and reliable. From real-time tracking to verified drivers, our
            protocols are built with your protection in mind.
          </p>
        </div>
        <div className="flex gap-4 justify-center items-center">
          {/* <img src="customer1" alt="safety1" className="w-32 md:w-40 rounded-lg shadow-md" />
          <img src="customer2" alt="safety2" className="w-32 md:w-40 rounded-lg shadow-md -mt-10" />
          <img src="customer3" alt="safety3" className="w-32 md:w-40 rounded-lg shadow-md mt-4" /> */}
        </div>
      </div>

      {/* Section: Covers Everyone */}
      <div className="mt-20">
        <h2 className="text-3xl font-semibold mb-12">Safety for Everyone</h2>
        <div className="grid md:grid-cols-2 gap-10">
          {/* Customer Card */}
          <div className="flex flex-col items-center text-center">
            {/* <img src={customer2} alt="Customer" className="rounded-xl mb-4 w-full max-w-sm" /> */}
            <h3 className="text-xl font-semibold">For Riders</h3>
            <p className="text-gray-700 mt-2">
              All rides are GPS-tracked, and our support team is available 24/7. You’re always
              in safe hands when riding with us.
            </p>
           
          </div>

          {/* Captain Card */}
          <div className="flex flex-col items-center text-center">
            {/* <img src={customer3} alt="Captain" className="rounded-xl mb-4 w-full max-w-sm" /> */}
            <h3 className="text-xl font-semibold">For Partners</h3>
            <p className="text-gray-700 mt-2">
              Every captain undergoes thorough background checks, safety workshops, and
              vehicle inspections to ensure a secure experience for all.
            </p>
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default Safety;
