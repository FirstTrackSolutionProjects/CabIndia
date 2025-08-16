// import React, { useState } from 'react';

// const Welcome = () => {
//   return (
//     <div className="flex absolute inset-0 mt-16 bg-gray-900 md:items-center">
//       <div className="flex-col text-white w-full bg-gray-900 flex items-center justify-center sm:p-0 px-5 ">
//         <div className="flex justify-center items-center flex-col">
//         <p className="text-center md:text-6xl text-5xl font-extrabold sm:block flex flex-col items-center  ">GET YOUR <span className="text-yellow-400">FIRST RIDE</span> NOW</p>
//         <p className="text-center md:text-xl text-sm sm:mt-5 mt-10 text-white ">AUTO • BIKES • CARS • PARCEL DELIVERY • FOOD DELIVERY</p>
//         <div className="md:w-auto w-full">
//           <form
//             className="flex md:flex-row flex-col w-full items-center justify-between mt-16"
//             action=""
//           >

//               <input
//                 className="md:w-60 w-full h-10 rounded-xl p-2 text-black font-bold bg-white"
//                 placeholder="Source"
//                 type="text"
//                 name="source"
//               />
          
//             <div className="flex justify-center items-center w-16 h-10">
//               • • •
//             </div>
            
//               <input
//                 className="md:w-60 w-full h-10 rounded-xl p-2 text-black font-bold bg-white"
//                 type="text"
//                 name="destination"
//                 placeholder="Destination"
//               />
            

//             <button className="w-32 h-10 m-6 p-2 bg-white rounded-xl mx-4 text-black">
//               Get Your Fare
//             </button>
//           </form>
//         </div>
//         </div>
//       </div>
//       {/* <div className="fixed z-10 lg:block hidden right-0 w-[40%] bg-black rounded-tl-[85%] overflow-hidden">
//         <div className="w-full bg-gray-300 flex items-center justify-center ">
//             <div className="overflow-hidden bg-black border-none">
//           <img className="w-full h-screen " src={welcome} alt="" />
//           </div>
//         </div>
//       </div> */}
//     </div>
//   );
// };

// export default Welcome;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!source || !destination) {
      alert("Please enter both source and destination");
      return;
    }

    // Navigate to FareDetails and pass state
    navigate("/fare", {
      state: { source, destination },
    });
  };

  return (
    <div className="flex absolute inset-0 mt-16 bg-gray-900 md:items-center">
      <div className="flex-col text-white w-full bg-gray-900 flex items-center justify-center sm:p-0 px-5">
        <div className="flex justify-center items-center flex-col">
          <p className="text-center md:text-6xl text-5xl font-extrabold sm:block flex flex-col items-center">
            GET YOUR <span className="text-yellow-400">FIRST RIDE</span> NOW
          </p>
          <p className="text-center md:text-xl text-sm sm:mt-5 mt-10 text-white">
            AUTO • BIKES • CARS • PARCEL DELIVERY • FOOD DELIVERY
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex md:flex-row flex-col w-full items-center justify-between mt-16"
          >
            <input
              type="text"
              placeholder="Source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="md:w-60 w-full h-10 rounded-xl p-2 text-black font-bold bg-white"
            />
            <div className="flex justify-center items-center w-16 h-10 text-2xl text-white">• • •</div>
            <input
              type="text"
              placeholder="Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="md:w-60 w-full h-10 rounded-xl p-2 text-black font-bold bg-white"
            />
            <button type="submit" className="w-32 h-10 m-6 p-2 bg-white rounded-xl mx-4 text-black">
              Get Your Fare
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Welcome;

