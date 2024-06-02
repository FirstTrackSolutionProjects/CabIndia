import Carousel from "../Components/Carousel"
import Footer from "../Components/Footer"
import Header from "../Components/Header"


const RightServiceCard = () => {
    return (
        <>
            <div className="flex w-full bg-gray-800 justify-center items-center py-4 ">
                <div className="flex xl:flex-row-reverse flex-col-reverse justify-center items-center xl:w-4/5 w-full ">
                    <div className=" flex flex-col justify-center xl:w-2/3 w-4/5 xl:h-[500px] h-auto bg-gray-700 text-white font-md p-10 shadow-all shadow-gray-900 rounded-3xl overflow-hidden">
                        <div className="text-3xl my-2">
                            SERVICE TITLE
                        </div>
                        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptas facilis maxime, atque iure deleniti maiores, nihil aliquam dicta molestias praesentium esse eaque, veritatis blanditiis eos libero excepturi hic beatae a!
                        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptas facilis maxime, atque iure deleniti maiores, nihil aliquam dicta molestias praesentium esse eaque, veritatis blanditiis eos libero excepturi hic beatae a!
                        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptas facilis maxime, atque iure deleniti maiores, nihil aliquam dicta molestias praesentium esse eaque, veritatis blanditiis eos libero excepturi hic beatae a!
                        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptas facilis maxime, atque iure deleniti maiores, nihil aliquam dicta molestias praesentium esse eaque, veritatis blanditiis eos libero excepturi hic beatae a!                    
                    </div>
                    <div className="xl:w-1/3 w-4/5 xl:h-[500px] h-auto flex items-center justify-center">
                        <img src="logo.png" alt="" />
                    </div>
                </div>
            </div>
        </>
    )
}

const LeftServiceCard = () => {
    return (
        <>
            <div className="flex w-full bg-gray-800 justify-center items-center py-4 ">
                <div className="flex xl:flex-row flex-col-reverse justify-center items-center xl:w-4/5 w-full ">
                    <div className=" flex flex-col justify-center xl:w-2/3 w-4/5 xl:h-[500px] h-auto bg-gray-700 text-white font-md p-10 shadow-all shadow-gray-900 rounded-3xl overflow-hidden">
                        <div className="text-3xl my-2">
                            SERVICE TITLE
                        </div>
                        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptas facilis maxime, atque iure deleniti maiores, nihil aliquam dicta molestias praesentium esse eaque, veritatis blanditiis eos libero excepturi hic beatae a!
                        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptas facilis maxime, atque iure deleniti maiores, nihil aliquam dicta molestias praesentium esse eaque, veritatis blanditiis eos libero excepturi hic beatae a!
                        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptas facilis maxime, atque iure deleniti maiores, nihil aliquam dicta molestias praesentium esse eaque, veritatis blanditiis eos libero excepturi hic beatae a!
                        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptas facilis maxime, atque iure deleniti maiores, nihil aliquam dicta molestias praesentium esse eaque, veritatis blanditiis eos libero excepturi hic beatae a!                    
                    </div>
                    <div className="xl:w-1/3 w-4/5 xl:h-[500px] h-auto flex items-center justify-center">
                        <img src="logo.png" alt="" />
                    </div>
                </div>
            </div>
        </>
    )
}



const CabServices = () => {
  return (
    <>
        <Header width="full" active="Cabs" isLoggedIn={true} />
        <Carousel images={['career_1.jpg']} />
        <div className="text-center w-full h-32 py-8 bg-gray-800 flex justify-center items-center sm:text-5xl text-2xl font-bold text-white">
            WE ARE ALWAYS AT YOUR SERVICE
        </div>
        <RightServiceCard />
        <LeftServiceCard />
        <RightServiceCard />
        <LeftServiceCard />
        <RightServiceCard />
        <Footer />
    </>
  )
}

export default CabServices
