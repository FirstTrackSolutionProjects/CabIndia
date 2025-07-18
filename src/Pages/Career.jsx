import Carousel from '../Components/Carousel'
// import LeftAboutUs from '../Components/LeftAboutUs'
// import RightAboutUs from '../Components/RightAboutUs'
import Footer from '../Components/Footer'
import CareerForm from '../Components/CareerForm'
//  import Closing from '../Components/Closing'
import SubFooter from '../Components/SubFooter'

const Career = () => {
  return (
    <>
        <Carousel images={['logo.png','welcome.jpg', 'career_1.jpg']} />
        <CareerForm />
        {/* <LeftAboutUs />
        <RightAboutUs />
        <LeftAboutUs />
        <RightAboutUs /> */}
        <SubFooter/>
        <Footer />
    </>
  )
}

export default Career
