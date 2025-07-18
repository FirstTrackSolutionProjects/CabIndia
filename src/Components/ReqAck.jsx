// import RequestCard from "./RequestCard"


// const ReqAck = ({step, stepUp} : {step:number, stepUp:()=>void}) => {
//   return (
//     <div onClick={()=>stepUp()} className={`bg-white absolute transition-all duration-300 w-full md:w-96 ${step==1?"h-96":"h-0 overflow-hidden"} z-30  bottom-0 shadow-userCard flex flex-col justify-between items-center`}>
//         <div className=" h-auto w-full flex-col justify-center items-center bg-white">
//             <div className="text-xl font-bold text-center py-3">
//                 REQUEST FROM
//             </div>
//             <div className="px-4">
//             <RequestCard />
//             </div>
//             <div className="font-bold text-center py-2">
//                 Fare Breakdown
//             </div>
//             <div className="relative px-3 h-6">
//                 <p className="mx-3 flex relative">
//                     <p className="absolute left-0">Base Fare</p>
//                     <p className="absolute right-0">500</p>
//                 </p>
//             </div>
//             <div className="relative px-3 h-6">
//                 <p className="mx-3 flex relative">
//                     <p className="absolute left-0">Service Fare</p>
//                     <p className="absolute right-0">100</p>
//                 </p>
//             </div>
//             <div className="relative px-3 h-6">
//                 <p className="mx-3 flex relative">
//                     <p className="absolute left-0">/Km Fare</p>
//                     <p className="absolute right-0">40</p>
//                 </p>
//             </div>
//             <div className="relative px-3 h-6">
//                 <p className="mx-3 flex relative">
//                     <p className="absolute left-0">Fine</p>
//                     <p className="absolute right-0">0</p>
//                 </p>
//             </div>
//             <div className="relative px-3 h-6">
//                 <p className="mx-3 flex relative font-bold">
//                     <p className="absolute left-0">Grand Total</p>
//                     <p className="absolute right-0">640</p>
//                 </p>
//             </div>

            
//         </div>
//         <div className="relative w-4/5 h-16 bg-white m-2 flex">
//             <div className="absolute left-0 h-16 w-16 rounded-full bg-red-400"></div>
//             <div className="absolute right-0 h-16 w-16 rounded-full bg-green-400"></div>
//         </div>

//     </div>
//   )
// }

// export default ReqAck
