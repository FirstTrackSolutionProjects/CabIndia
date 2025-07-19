import React, { useState } from "react";
import { Link } from "react-router-dom";

const Login = () => {
  const [activeTab, setActiveTab] = useState("customer");

  const renderForm = () => {
    return (
      <form className="space-y-4">
        <input
          type="text"
          placeholder={activeTab === "customer" ? "Customer Name" : "Rider Name"}
          className="w-full p-3 bg-blue-100 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 bg-blue-100 rounded"
        />
        <button
          type="submit"
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded font-semibold"
        >
          Login
        </button>
      </form>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md relative">
        {/* Tabs */}
        <div className="flex space-x-4 mb-4 absolute top-[-2.5rem] left-6">
          <button
            onClick={() => setActiveTab("customer")}
            className={`px-4 py-1 rounded-t-md font-medium ${
              activeTab === "customer"
                ? "bg-white border border-b-0 text-black"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            Customer
          </button>
          <button
            onClick={() => setActiveTab("rider")}
            className={`px-4 py-1 rounded-t-md font-medium ${
              activeTab === "rider"
                ? "bg-white border border-b-0 text-black"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            Rider
          </button>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        {/* Form */}
        {renderForm()}

        {/* Register Link */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
          to={activeTab === "rider" ? "/register/join-captain-form" : `/register/${activeTab}`}
          className="text-blue-600 hover:underline"
        >
          Register here
        </Link>

        </p>
      </div>
    </div>
  );
};

export default Login;
