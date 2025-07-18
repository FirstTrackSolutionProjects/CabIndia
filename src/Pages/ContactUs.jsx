// import Carousel from '../Components/Carousel'
// import Contact from '../Components/Contact'
// import Footer from '../Components/Footer'
// import SubFooter from '../Components/SubFooter'

// const ContactUs = () => {
//   return (
//     <>
//         <Carousel images={['logo.png',  'welcome.jpg']} />
//         <Contact />
//         <SubFooter />
//         <Footer />
//     </>
//   )
// }

// export default ContactUs

import React from "react";

const Contact = () => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
      <form className="space-y-4">
        <input type="text" placeholder="Name" className="w-full p-2 border rounded" />
        <input type="email" placeholder="Email" className="w-full p-2 border rounded" />
        <textarea placeholder="Message" rows="5" className="w-full p-2 border rounded"></textarea>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Send</button>
      </form>
    </div>
  );
};

export default Contact;
