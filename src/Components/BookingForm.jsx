// import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
// import { useState, useEffect } from 'react';
// // import axios from 'axios';
// import RideCard from './RideCard';

// const Booking = () => {
//   const [formData,setFormData] = useState({
//     source: '',
//     destination : ''
//   })
//   const containerStyle = {
//     width: '100%',
//     height: '100%',

//   };
  
//   const [center,setCenter] = useState({
//     lat: 26.6469618,
//     lng: 84.9088929
//   });

//   const { isLoaded } = useJsApiLoader({
//     id: 'google-map-script',
//     googleMapsApiKey: import.meta.env.VITE_APP_MAP_API_KEY 
// });

// const [markerPosition, setMarkerPosition] = useState(center);
// // const [coordinates, setCoordinates] = useState<{lat : number, lng:number} | null>(null);

// const handleMapClick = async (event : any) => {
//     const lat = event.latLng.lat();
//     const lng = event.latLng.lng();
//     setMarkerPosition({ lat, lng });
//     // setCoordinates({ lat, lng });

//     // const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(formData.source)}&key=${import.meta.env.VITE_APP_MAP_API_KEY}`);
//     // if (response.data.results.length > 0) {
//     //   const { lat, lng } = response.data.results[0].geometry.location;
//     //   setCenter({ lat, lng });
//     //   setMarkerPosition({ lat, lng });
//     // } else {
        
//     // }
// };
// const handleChange = (e :any) => {
//   const { name, value } = e.target;
//   setFormData((prevData) => ({
//     ...prevData,
//     [name]: value
//   }));
// };

// useEffect(() => {
//   // Get user's current location
//   if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//           (position) => {
//               const { latitude, longitude } = position.coords;
//               setCenter({ lat: latitude, lng: longitude });
//               setMarkerPosition({ lat: latitude, lng: longitude });
//           },
//           (error) => {
//               console.error('Error getting user location:', error);
//           }
//       );
//   } else {
//       console.error('Geolocation is not supported by this browser.');
//   }
// }, []);
//   const [step, setStep] = useState<number>(0)
//   const stepUp = () => {
//     if (step==3) return
//     setStep(step+1);
//   }
//   // const stepDown = () => {
//   //   if (step ==0) return
//   //   setStep(step-1);
//   // }
//   const handleSubmit = (e : any) => {
//     e.preventDefault()
//     stepUp();
//   }
//   return (
//     <>
//       <div className='absolute inset-0 pt-16 flex justify-center items-center'>
//       {isLoaded ? (
//         <>
//             <GoogleMap
//                 mapContainerStyle={containerStyle}
//                 center={center}
//                 zoom={16}
//                 onClick={handleMapClick}
//                 // onCenterChanged={() => setCenter((window as any).google.maps.getCenter())}
//             >
//                 <Marker position={markerPosition} />
//             </GoogleMap>
           
//         </>
//     ) : <></>} 
//         <div  className={`absolute transition-all duration-300 overflow-hidden ${step==0?"h-60 py-4":"h-0 p-0"} bottom-0 md:w-[700px] w-full bg-white`}>
//           <div className='w-full text-xl text-center p-2 font-bold'>
//             CHOOSE YOUR WAY
//           </div>
//           <div className='relative'>
//           <div className='absolute bottom-[73px] left-[8%] h-14 border-r-[4px] w-[12px] border-gray-500'>
//                     <div className='relative h-full '>
//                       <p className='absolute text-5xl top-0 h-1 flex items-center justify-center'>•</p>
//                       <p className='absolute text-5xl bottom-0 h-1 flex items-center justify-center '>•</p>
//                     </div>
//               </div>
//             <form
//             className="w-full flex flex-col justify-center items-center "
//             action=""
//             onSubmit={handleSubmit}
//           >

//               <input
//                 className="bg-gray-100 p-2 w-4/5 rounded-3xl mb-3"
//                 value={formData.source}
//                 onChange={handleChange}
//                 placeholder="Source"
//                 type="text"
//                 name="source"
//               />
            
//               <input
//                 className="bg-gray-100 p-2 w-4/5 rounded-3xl mb-3"
//                 value={formData.destination}
//                 onChange={handleChange}
//                 type="text"
//                 name="destination"
//                 placeholder="Destination"
//               />
            

//             <button type='submit' className="w-4/5 p-2 rounded-3xl bg-gray-200 ">
//               Get Your Fare
//             </button>
//           </form>
          
//           </div>
//         </div>

//         <div className={`absolute transition-all duration-300 overflow-hidden ${step==1?"h-96 py-4":"h-0 p-0"} bottom-0 sm:w-[500px] w-full bg-white`}>
//         <div className='w-full text-xl text-center p-2 font-bold'>
//             CHOOSE YOUR RIDE
//           </div>
//           <RideCard stepUp={stepUp} />
//           <RideCard stepUp={stepUp}/>
//           <RideCard stepUp={stepUp}/>
//           <RideCard stepUp={stepUp}/>
//         </div>

//         <div  className={`absolute transition-all duration-300 overflow-hidden ${step==2?"h-72 py-4":"h-0 p-0 "} bottom-0 sm:w-[500px] w-full bg-white flex flex-col justify-center items-center`}>
//           <div className='w-full text-xl text-center p-2 font-bold'>
//             CHOOSE YOUR PAY METHOD
//           </div>
//           <div className='w-full flex flex-col items-center py-4'>
//             <div onClick={()=>stepUp()} className='w-full flex justify-center border'> 
//             <label  htmlFor="cash" className='py-4  w-4/5 text-center '>Cash</label>
//             </div>
//             <div onClick={()=>stepUp()} className='w-full flex justify-center border mb-4'>
            
//             <label htmlFor="online" className='py-4 w-4/5 text-center'>Online</label>
//             </div>
//             <form onSubmit={(e)=>e.preventDefault()} action="" className='w-full flex px-4'>
//               <input className='flex-1 p-2 border-2' type="text" placeholder='Coupon Code' />
//               <button className='px-4 py-2 border-2'>Apply</button>
//             </form>
//           </div>
          
//         </div>

//         <div onClick={()=>setFormData({source: '', destination:''})} className={`absolute transition-all duration-300 overflow-hidden ${step==3?"h-[600px] py-4":"h-0 p-0 "} bottom-0 sm:w-[400px] w-full bg-white flex flex-col justify-center items-center`}>
//         <div className='w-full text-xl text-center p-2 font-bold'>
//             YOUR RIDE INFO
//           </div>
//           <div className='w-full px-4 flex my-3'>
//             <img src="logo.png" alt="" className='w-24 h-24 border' />
//             <div className='h-24 flex-1 flex flex-col items-center justify-center'>
//               <p className='font-bold'>Aditya Kumar Prakash</p>
//               <p className=''>Mahindra SUV</p>
//               <p className=''>MH12B1234</p>
//             </div>
//           </div>
//           <div className='w-full px-4 my-3'>
//             <p className='font-bold text-center text-lg mb-2'>DRIVER DETAILS</p>
//             <div className='flex'>
//             <img src="logo.png" alt="" className='w-18 h-24 border' />
//             <div className='flex-1'>
//               <p className='font-bold text-center'>Aditya Kumar Prakash</p>
//               <p className='text-center'>Rating : 4.5</p>
//               <p className='text-center'>Age: 37</p>
//             </div>
//             </div>
//             <button className='px-4 py-2 w-full border border-green-400 my-2 text-green-400'>Call Now</button>
//           </div>
//           <div className='w-full px-4 my-3'>
//             <p className='font-bold text-center text-lg'>FARE DETAILS</p>
//             <div className="relative px-3 h-6">
//                 <p className="mx-3 flex relative">
//                     <p className="absolute left-0">Source</p>
//                     <p className="absolute right-0">Motihari</p>
//                 </p>
//             </div>
//             <div className="relative px-3 h-6">
//                 <p className="mx-3 flex relative">
//                     <p className="absolute left-0">Destination</p>
//                     <p className="absolute right-0">Bhagalpur</p>
//                 </p>
//             </div>
//             <div className="relative px-3 h-6">
//                 <p className="mx-3 flex relative">
//                     <p className="absolute left-0">Estd. Time</p>
//                     <p className="absolute right-0">35 mins</p>
//                 </p>
//             </div>
//             <div className="relative px-3 h-6">
//                 <p className="mx-3 flex relative">
//                     <p className="absolute left-0">Distance</p>
//                     <p className="absolute right-0">15 Km</p>
//                 </p>
//             </div>
//             <div className="relative px-3 h-6">
//                 <p className="mx-3 flex relative">
//                     <p className="absolute left-0">Estd Fare</p>
//                     <p className="absolute right-0">₹520</p>
//                 </p>
//             </div>
//             <button className='px-4 py-2 w-full border my-2 text-red-400 border-red-400'>Cancel Ride</button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Booking;

import React, { useState } from "react";

const BookingForm = () => {
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [vehicle, setVehicle] = useState("Bike");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pickup || !drop) {
      alert("Please enter both pickup and drop locations.");
      return;
    }

    alert(`Ride booked!\nPickup: ${pickup}\nDrop: ${drop}\nVehicle: ${vehicle}`);
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow-md rounded mt-6">
      <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Book a Ride</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
          placeholder="Pickup Location"
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          value={drop}
          onChange={(e) => setDrop(e.target.value)}
          placeholder="Drop Location"
          className="w-full p-2 border rounded"
        />
        <select
          value={vehicle}
          onChange={(e) => setVehicle(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option>Bike</option>
          <option>Auto</option>
          <option>Car</option>
        </select>
        <button type="submit" className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600">
          Confirm Booking
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
