import React, { useState } from "react";

const CaptainForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    vehicle: "Bike",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, phone, city } = formData;
    if (!name || !phone || !city) {
      alert("Please fill all fields.");
      return;
    }

    alert(`Thanks ${formData.name}, your registration as a captain has been submitted!`);
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow-md rounded mt-6">
      <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Become a Captain</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="city"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <select
          name="vehicle"
          value={formData.vehicle}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option>Bike</option>
          <option>Auto</option>
        </select>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Submit Application
        </button>
      </form>
    </div>
  );
};

export default CaptainForm;
