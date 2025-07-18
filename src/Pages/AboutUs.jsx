// import Carousel from '../Components/Carousel'
// import Footer from '../Components/Footer'
// import LeftAboutUs from '../Components/LeftAboutUs'
// import RightAboutUs from '../Components/RightAboutUs'

// const AboutUs = () => {
//   return (
//    <>
//     <Carousel images={['logo.png', 'welcome.jpg']} />
//     <LeftAboutUs />
//     <RightAboutUs />
//     <LeftAboutUs />
//     <RightAboutUs />
//     <Footer />
//    </>
//   )
// }

// export default AboutUs

import React from "react";

const About = () => {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">About RapidoClone</h2>
      <p className="text-gray-700">
        RapidoClone is a two-wheeler ride-hailing platform inspired by Rapido. We offer affordable and quick transport options for everyday commuting in urban India.
      </p>
    </div>
  );
};

export default About;
