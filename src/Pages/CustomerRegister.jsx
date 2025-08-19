import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const CustomerRegister = () => {
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    alert("Registered successfully as Customer!");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">Register as Customer</h2>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Full Name"
            className="w-full mb-4 px-4 py-2 border rounded"
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full mb-4 px-4 py-2 border rounded"
            required
          />
           <div className="flex space-x-2">
              <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-white">
                <span className="text-xl mr-2">🇮🇳</span>
                <span className="text-gray-800">+91</span>
              </div>
            
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-5/6 border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            
          <input
            type="password"
            placeholder="Create Password"
            className="w-full mb-4 px-4 py-2 border rounded mt-4"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full mb-4 px-4 py-2 border rounded"
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

export default CustomerRegister;
