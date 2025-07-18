import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState("customer");

  const handleRegister = (e) => {
    e.preventDefault();
    alert(`Registered successfully as ${userType}!`);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-md">
        {/* Tabs for Customer / Rider */}
        <div className="flex justify-between mb-6">
          <button
            onClick={() => setUserType("customer")}
            className={`w-1/2 py-2 font-semibold rounded-l ${userType === "customer" ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Customer
          </button>
          <button
            onClick={() => setUserType("rider")}
            className={`w-1/2 py-2 font-semibold rounded-r ${userType === "rider" ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Rider
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister}>
          <h2 className="text-xl font-bold mb-4 text-center">Register as {userType.charAt(0).toUpperCase() + userType.slice(1)}</h2>

          <input
            type="text"
            placeholder="Full Name"
            className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring"
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring"
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full mb-6 px-4 py-2 border rounded focus:outline-none focus:ring"
            required
          />

          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded"
          >
            Register
          </button>

          <p className="text-center text-sm mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
