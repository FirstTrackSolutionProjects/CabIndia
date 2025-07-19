const CareerForm = () => {
  return (
    <div className="w-full flex flex-col items-center bg-white p-6">
      <div className="text-black md:text-5xl text-3xl font-bold text-center">
        JOIN OUR TEAM
      </div>
      <form
        action=""
        className="md:w-[750px] w-full flex justify-center items-center flex-col py-6"
      >
        <div className="flex flex-col sm:flex-row w-full justify-between">
          <input
            placeholder="First Name"
            className="bg-gray-100 text-black sm:w-[360px] w-full mr-3 my-3 p-3 rounded-md border"
            type="text"
            name="fname"
          />
          <input
            placeholder="Last Name"
            className="bg-gray-100 text-black sm:ml-3 sm:my-3 p-3 rounded-md border sm:w-[360px] w-full"
            type="text"
            name="lname"
          />
        </div>

        <div className="flex flex-col sm:flex-row w-full justify-between">
          <input
            placeholder="Mobile"
            className="bg-gray-100 text-black sm:w-[360px] w-full mr-3 my-3 p-3 rounded-md border"
            type="text"
            name="mobile"
          />
          <input
            placeholder="E-mail"
            className="bg-gray-100 text-black sm:ml-3 sm:my-3 p-3 rounded-md border sm:w-[360px] w-full"
            type="email"
            name="email"
          />
        </div>

        <div className="flex flex-col sm:flex-row w-full justify-between">
          <input
            placeholder="Date of Birth"
            className="bg-gray-100 text-black sm:w-[230px] w-full mr-3 my-3 p-3 rounded-md border"
            type="date"
            name="dob"
          />
          <select
            name="gender"
            className="bg-gray-100 text-black sm:ml-3 sm:my-3 p-3 mb-3 rounded-md border sm:w-[150px] w-full"
          >
            <option value="">Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <select
            name="quali"
            className="bg-gray-100 text-black sm:ml-3 sm:my-3 p-3 rounded-md border sm:w-[310px] w-full"
          >
            <option value="">Qualification</option>
            <option value="10th">10th</option>
            <option value="12th">12th</option>
            <option value="Under Graduate">Under Graduate</option>
            <option value="Graduate">Graduate</option>
            <option value="Post Graduate">Post Graduate</option>
          </select>
        </div>

        <input
          placeholder="Street Address"
          className="bg-gray-100 text-black mt-3 sm:my-3 w-full py-3 px-3 rounded-md border"
          type="text"
          name="address"
        />

        <div className="flex flex-col sm:flex-row w-full justify-between">
          <input
            placeholder="City"
            className="bg-gray-100 text-black sm:w-[360px] w-full mr-3 my-3 p-3 rounded-md border"
            type="text"
            name="city"
          />
          <input
            placeholder="State"
            className="bg-gray-100 text-black sm:ml-3 sm:my-3 p-3 rounded-md border sm:w-[360px] w-full"
            type="text"
            name="state"
          />
        </div>

        <div className="flex flex-col sm:flex-row w-full justify-between">
          <input
            placeholder="Pincode"
            className="bg-gray-100 text-black sm:w-[360px] w-full mr-3 my-3 p-3 rounded-md border"
            type="text"
            name="pincode"
          />
          <input
            placeholder="Country"
            className="bg-gray-100 text-black sm:ml-3 sm:my-3 p-3 rounded-md border sm:w-[360px] w-full"
            type="text"
            name="country"
          />
        </div>

        <textarea
          placeholder="Message (Upto 1000 Characters)"
          className="h-48 bg-gray-100 text-black my-3 w-full py-3 px-3 rounded-md border"
          name="message"
        />

        <div className="flex w-full justify-center">
          <label htmlFor="dl" className="bg-gray-200 text-black p-3 rounded-md cursor-pointer">
            Upload Resume/CV
          </label>
          <input id="dl" name="dl" type="file" className="hidden" />
        </div>

        <div className="w-full my-6 relative">
          <button className="absolute right-0 py-3 px-10 bg-black text-white rounded-md">
            Apply
          </button>
        </div>
      </form>
    </div>
  );
};

export default CareerForm;
