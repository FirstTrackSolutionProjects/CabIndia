import React from "react";
import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc"

const RiderLogin = () => {
    return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md relative">
        {/* Heading */}
        <h2 className="text-2xl font-bold text-center mb-6">Rider Login</h2>

        {/* Form */}
        <form className="space-y-4">
        <input
            type="text"
            placeholder="Email or Phone Number"
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

         {/* Divider */}
                <div className="flex items-center my-6">
                <div className="flex-grow h-px bg-gray-300"></div>
                <span className="px-3 text-gray-500 text-sm">OR</span>
                <div className="flex-grow h-px bg-gray-300"></div>
                </div>
        
                {/* Google Login Button */}
                <button
                className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded hover:bg-gray-100 transition"
                >
                <FcGoogle className="text-xl" />
                <span className="font-medium">Login with Google</span>
                </button>

        {/* Register Link */}
        <p className="mt-4 text-center text-sm text-gray-600">
        Don’t have an account?{" "}
        <Link
            to="/register/join-captain-form"
            className="text-blue-600 hover:underline"
        >
            Register here
        </Link>
        </p>
    </div>
    </div>
);
};

export default RiderLogin;
