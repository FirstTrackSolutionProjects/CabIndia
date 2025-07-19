import Carousel from '../Components/Carousel'
import CareerForm from '../Components/CareerForm'


const Career = () => {
  return (
    <>
        <Carousel images={['logo.png','welcome.jpg', 'career_1.jpg']} />
        <CareerForm />
       
    </>
  )
}

export default Career
