import Carousel from '../Components/Carousel'

 import LeftAboutUs from '../Components/LeftAboutUs'
 import RightAboutUs from '../Components/RightAboutUs'
import MeetOurCaptains from '../Components/MeetOurCaptain'
import JoinAsCaptain from '../Components/JoinAsCaptain'

const AboutUs = () => {
  return (
   <>
    <Carousel images={['logo.png', 'welcome.jpg', 'bike.png']} />
    <LeftAboutUs />
    <RightAboutUs />
    <MeetOurCaptains/>
    <JoinAsCaptain/>
   </>
  )
}

export default AboutUs


