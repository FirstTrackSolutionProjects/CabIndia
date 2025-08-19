import Carousel from '../Components/Carousel'

 import LeftAboutUs from '../Components/LeftAboutUs'
 import RightAboutUs from '../Components/RightAboutUs'
import MeetOurCaptains from '../Components/MeetOurCaptain'
import JoinAsCaptain from '../Components/JoinAsCaptain'

const AboutUs = () => {
  return (
   <>
    <Carousel images={['logo.png', 'welcome.jpg', 'bike.png']} />
    <LeftAboutUs />
    <RightAboutUs />
    <MeetOurCaptains/>
    <JoinAsCaptain/>
   </>
  )
}

export default AboutUs

// import React from 'react';

// const AboutUs = () => {
//   return (
//     <div className="min-h-screen bg-gray-50 text-gray-800">
//       {/* Hero Section */}
//       <div className="relative">
//         <img
//           src="/images/about-banner.jpg" // <-- replace with your own image path
//           alt="About Us Banner"
//           className="w-full h-64 object-cover"
//         />
//         <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//           <h1 className="text-white text-4xl font-bold">About Us</h1>
//         </div>
//       </div>

//       {/* Intro */}
//       <div className="max-w-5xl mx-auto px-6 py-12">
//         <h2 className="text-2xl font-bold mb-4 text-center">Who We Are</h2>
//         <p className="text-center mb-10 text-gray-700">
//           We are on a mission to redefine urban mobility by providing affordable, safe,
//           and fast transportation for everyone. Whether it’s a quick bike ride or an
//           auto trip across the city, <span className="font-semibold text-yellow-600">CabIndia</span> is your go-to solution.
//         </p>

//         <div className="grid md:grid-cols-2 gap-8">
//           <div>
//             <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
//             <p>
//               To become India's most trusted and widely used mobility platform, offering
//               reliable transportation with just a tap on your phone.
//             </p>
//           </div>
//           <div>
//             <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
//             <p>
//               We aim to empower riders and customers with seamless, tech-enabled transport
//               that saves time, reduces carbon footprint, and enhances daily commuting.
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Why Choose Us Section */}
//       <div className="bg-yellow-50 py-12">
//         <div className="max-w-5xl mx-auto px-6 text-center">
//           <h2 className="text-2xl font-bold mb-8">Why Choose CabIndia?</h2>
//           <div className="grid md:grid-cols-3 gap-6">
//             <div className="bg-white shadow rounded-lg p-6">
//               <img src="/images/safe.png" alt="Safe" className="h-16 mx-auto mb-4" />
//               <h4 className="font-semibold text-lg mb-2">Safe Rides</h4>
//               <p>Verified riders and real-time tracking ensure passenger safety at all times.</p>
//             </div>
//             <div className="bg-white shadow rounded-lg p-6">
//               <img src="/images/affordable.png" alt="Affordable" className="h-16 mx-auto mb-4" />
//               <h4 className="font-semibold text-lg mb-2">Affordable Pricing</h4>
//               <p>Get around your city with budget-friendly fares for every ride.</p>
//             </div>
//             <div className="bg-white shadow rounded-lg p-6">
//               <img src="/images/fast.png" alt="Fast" className="h-16 mx-auto mb-4" />
//               <h4 className="font-semibold text-lg mb-2">Fast & Reliable</h4>
//               <p>With our tech-driven system, enjoy quick pickups and on-time arrivals.</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Join Us */}
//       <div className="max-w-5xl mx-auto px-6 py-12 text-center">
//         <h2 className="text-2xl font-bold mb-4">Join the Movement</h2>
//         <p className="mb-6">
//           Be a part of our growing community—whether you want to ride with us or earn by driving.
//         </p>
//         <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded font-semibold">
//           Register as Rider
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AboutUs;

