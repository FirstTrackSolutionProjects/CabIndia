import { useState } from 'react';


const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    message: ''
  });

  const [popup, setPopup] = useState({ show: false, success: false, message: "" });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
      console.log("Form submitted", formData);

setPopup({
      show: true,
      success: true,
      message: "Your message has been sent successfully!"
    });
  setFormData({ name: "", email: "", mobile: "", message: "" });

    // Auto close after 3s
    setTimeout(() => {
      setPopup({ show: false, success: false, message: "" });
    }, 3000);
  };


  return (
      <div className="w-full min-h-screen bg-white flex justify-center items-center px-4 py-10">
      <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-2xl shadow-md p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Contact Us
        </h2>
        <p className="text-center text-gray-600 mb-8">
          We'd love to hear from you! Fill in the form and our team will reach out.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Your Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Mobile Number</label>
            <input
              type="text"
              name="mobile"
              required
              value={formData.mobile}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your mobile number"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Message</label>
            <textarea
              name="message"
              required
              value={formData.message}
              onChange={handleChange}
              rows="4"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your message"
            ></textarea>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
       {/* Popup Modal */}
      {popup.show && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg text-white font-medium animate-slideDown ${
              popup.success ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {popup.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;
