// import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
// import { useState } from 'react';
// import ReqAck from './ReqAck';
// import RequestCard from './RequestCard';
// // import axios from 'axios';


// const RiderDash = () => {
//   const { isLoaded } = useJsApiLoader({
//     id: 'google-map-script',
//     googleMapsApiKey: 'AIzaSyDOvHfx4YllThHklrc1ngcYVLuRNBYnHM0' // Replace with your API key
// });
// const containerStyle = {
//   width: '100%',
//   height: '100%',

// };

// const [center,setCenter] = useState({
//   lat: 26.6469618,
//   lng: 84.9088929
// });
// const [markerPosition, setMarkerPosition] = useState(center);
// // const [coordinates, setCoordinates] = useState<{lat : number, lng:number} | null>(null);

// const handleMapClick = async (event : any) => {
//     const lat = event.latLng.lat();
//     const lng = event.latLng.lng();
//     setMarkerPosition({ lat, lng });
//     // setCoordinates({ lat, lng });

//     // const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(formData.source)}&key=AIzaSyDOvHfx4YllThHklrc1ngcYVLuRNBYnHM0`);
//     // if (response.data.results.length > 0) {
//     //   const { lat, lng } = response.data.results[0].geometry.location;
//     //   setCenter({ lat, lng });
//     //   setMarkerPosition({ lat, lng });
//     // } else {
        
//     // }
// };
//   const [step, setStep] = useState<number>(0)
//   const stepUp = () => {
//     setStep(step+1);
//   }
//   // const stepDown = () => {
//   //   setStep(step-1);
//   // }
//   return (
//     <>
//         <div className="absolute w-full inset-0 flex justify-center items-center bg-gray-300">
//         {isLoaded ? (
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
//           <div onClick={()=>{stepUp()}} className={`absolute z-10 transition-all duration-300 ${step==0?"h-72":"h-0 overflow-hidden"} max-h-1/2 md:w-96 w-full bottom-0 bg-[url("driverBg.avif")] bg-no-repeat bg-cover overflow-hidden overflow-x-hidden `}>
//             <div className='shadow-cabCard sticky z-20 top-0 text-xl font-bold w-full bg-slate-400 text-center py-3'>
//               INCOMING REQUESTS
//             </div>
//             <div className='w-full h-max-1/2 scroll-auto'>
//               <RequestCard />
//               <RequestCard />
//               <RequestCard />
//             </div>
//           </div>
//           <ReqAck step={step} stepUp = {stepUp} />
//           <div className={`absolute z-0 bottom-0 sm:w-96 w-full transition-all duration-300 ${step==2?"h-[600px]":"h-0 overflow-hidden"} bg-white py-4 flex flex-col justify-center items-center`}>
//         <div className='w-full text-xl text-center p-2 font-bold'>
//             YOUR RIDE INFO
//           </div>
//           <div className='w-full px-4 flex my-3'>
//             <img src="logo.png" alt="" className='w-24 h-24 border' />
//             <div className='h-24 flex-1 flex flex-col items-center justify-center'>
//               <p className='font-bold'>Aditya Kumar</p>
//               <p className=''>Motihari</p>
//               <p onClick={()=>setCenter(center)} className=''>Bhagalpur</p>
//             </div>
//           </div>
//           <div className='w-full px-4 flex my-3'>
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
//             <button className='px-4 py-2 w-full border my-2 text-yellow-400 border-yellow-400'>Pass Ride</button>
//             <button className='px-4 py-2 w-full border my-2 text-red-400 border-red-400'>Cancel Ride</button>
//           </div>
//         </div>
//         </div>
//     </>
//   )
// }

// export default RiderDash
