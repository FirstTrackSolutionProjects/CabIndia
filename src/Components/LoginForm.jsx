// import React, { useState } from "react";

// const LoginForm = ({ onLogin, onToggle }) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleLogin = (e) => {
//     e.preventDefault();
//     onLogin(email, password);
//   };

//   return (
//     <div className="max-w-md mx-auto p-4 bg-white shadow rounded">
//       <form onSubmit={handleLogin}>
//         <h2 className="text-xl font-bold mb-4 text-center">Login</h2>
//         <input
//           type="email"
//           placeholder="Email"
//           className="w-full p-2 border mb-3 rounded"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           className="w-full p-2 border mb-4 rounded"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         />
//         <button
//           type="submit"
//           className="w-full bg-yellow-500 text-white py-2 rounded"
//         >
//           Login
//         </button>
//       </form>
//       <div className="mt-4 text-center">
//         <button
//           onClick={onToggle}
//           className="text-blue-600 hover:underline text-sm"
//         >
//           Don't have an account? Register here
//         </button>
//       </div>
//     </div>
//   );
// };

// export default LoginForm;
