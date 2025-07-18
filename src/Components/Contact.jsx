
import { useState } from 'react';
import emailjs from 'emailjs-com';
const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    message: ''
  });

  const handleChange = (e :any) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e : any) => {
    e.preventDefault();

    // Make the API call
    const templateParams = {
      email: formData.email,
      subject: "Mail from Contact Us | CabIndia",
      message: formData.message,
      name : formData.name,
      mobile : formData.mobile
    };
    const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID
    const templateID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
    const userID = import.meta.env.VITE_EMAILJS_USER_ID
    emailjs.send(serviceID, templateID, templateParams, userID)
      .then((response) => {
        console.log('Email sent successfully!', response.status, response.text);
        alert('Email sent successfully!');
      }, (error) => {
        console.error('Failed to send email.', error);
        alert('Error sending email. Please try again.');
      });
  };
  return (
    <>
    <div className='w-full flex flex-col justify-center items-center bg-gray-900'>
      {/* <div className=" flex justify-center items-center text-white text-3xl font-bold w-[900px] p-4">
        WANT TO REACH OUT TO US?
      </div> */}
      <div className="flex lg:flex-row flex-col  w-full justify-center items-center xs:p-16 p-2">
    <div className=" flex flex-col justify-center md:w-1/2 w-full p-4 text-4xl lg:text-6xl  font-bold text-white" >
      <p className=" text-center lg:w-auto lg:block flex justify-center w-full ">CONTACT US FROM </p><p className=" text-center lg:w-auto lg:block flex justify-center w-full text-yellow-400">ANY PART OF THE WORLD</p>
    </div>
      <form onSubmit={handleSubmit} action="" className="h-96 flex flex-col sm:w-3/4 px-6 justify-between py-6 md:w-96 w-full text-yellow-400">
        <input value={formData.name} onChange={handleChange} required className="md:w-80 w-full p-2 rounded-xl bg-gray-800" type="text" name="name" placeholder="Your good name" />
        <input value={formData.email} onChange={handleChange} required className="md:w-80 w-full p-2 rounded-xl bg-gray-800" type="email" name="email" placeholder="Your E-mail Address" />
        <input value={formData.mobile} onChange={handleChange} required className="md:w-80 w-full p-2 rounded-xl bg-gray-800" type="text" name="mobile" placeholder="Your Mobile Number" />
        <textarea value={formData.message} onChange={handleChange} required name="message" className="h-32 md:w-96 w-full p-2 rounded-xl bg-gray-800" placeholder="Your Message" />
        <button className="w-32 h-10 p-2 bg-gray-800 hover:bg-yellow-400 hover:text-black rounded-xl  text-white">
              Submit
        </button>
      </form>
    </div>
    </div>
    </>
  )
}

export default Contact
