import Carousel from '../Components/Carousel'
import Footer from '../Components/Footer'
import LeftAboutUs from '../Components/LeftAboutUs'
import RightAboutUs from '../Components/RightAboutUs'

const AboutUs = () => {
  return (
   <>
    <Carousel images={['logo.png', 'welcome.jpg']} />
    <LeftAboutUs />
    <RightAboutUs />
    <LeftAboutUs />
    <RightAboutUs />
    <Footer />
   </>
  )
}

export default AboutUs
