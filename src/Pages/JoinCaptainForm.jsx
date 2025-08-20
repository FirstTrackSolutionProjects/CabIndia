import React, { useState } from "react";
import { Link } from "react-router-dom";

const JoinCaptainForm = () => {
  const [sameAddress, setSameAddress] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
     <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-md mt-5 mb-16">

      <div>
            <img
            className="w-full h-60 object-cover rounded-xl mb-6"
            src="/images/rider-register.jpg"
            alt="Rider Register"
            />
        </div>


        {/* Heading */}
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Join as a Captain
        </h2>

        {/* form */}
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full px-4 py-2 border rounded-md"
          />
             <input
            type="password"
            placeholder="Create Password"
            className="w-full mb-4 px-4 py-2 border rounded mt-4"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full mb-4 px-4 py-2 border rounded"
            required
          />

          <div className="flex space-x-2">
            <div className="flex items-center border border-gray-300 rounded-md px-3 bg-white">
              <span className="text-xl mr-2">🇮🇳</span>
              <span className="text-gray-800">+91</span>
            </div>

            <input
              type="tel"
              placeholder="Phone Number"
              required
              className="w-5/6 border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <select required className="w-full px-4 py-2 border rounded-md">
            <option value="">Highest Qualification</option>
            <option>10th</option>
            <option>12th</option>
            <option>Diploma</option>
            <option>Graduate</option>
            <option>Post Graduate</option>
          </select>

          <select required className="w-full px-4 py-2 border rounded-md">
            <option value="">Gender</option>
            <option>Male</option>
            <option>Female</option>
          </select>

          <input
            type="date"
            placeholder="dd-mm-yyyy"
            required
            className="w-full px-4 py-2 border rounded-md"
          />

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Present Address
            </h3>
            <input
              type="text"
              placeholder="Address"
              required
              className="w-full px-4 py-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Landmark"
              required
              className="w-full px-4 py-2 border rounded-md"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="City"
                required
                className="w-full px-4 py-2 border rounded-md"
              />
              <input
                type="text"
                placeholder="State"
                required
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <input
              type="text"
              placeholder="Country"
              required
              className="w-full px-4 py-2 border rounded-md"
            />

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={sameAddress}
                onChange={() => setSameAddress(!sameAddress)}
              />
              <label>Same as Present Address</label>
            </div>

            {!sameAddress && (
              <>
                <h3 className="text-lg font-semibold text-gray-700">
                  Permanent Address
                </h3>
                <input
                  type="text"
                  placeholder="Address"
                  required
                  className="w-full px-4 py-2 border rounded-md"
                />
                <input
                  type="text"
                  placeholder="Landmark"
                  required
                  className="w-full px-4 py-2 border rounded-md"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    required
                    className="w-full px-4 py-2 border rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    required
                    className="w-full px-4 py-2 border rounded-md"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Country"
                  required
                  className="w-full px-4 py-2 border rounded-md"
                />
              </>
            )}
          </div>

          {/* Bank Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Bank Details
            </h3>
            <input
              type="text"
              placeholder="Account Holder Name"
              required
              className="w-full px-4 py-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Account Number"
              required
              className="w-full px-4 py-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="IFSC Code"
              required
              className="w-full px-4 py-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Bank Name"
              required
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">
              KYC Details
            </h3>
          <input 
              type="text"
              placeholder="Aadhaar Number"
              required
              className="w-full px-4 py-2 border rounded-md"
            />

             <input 
              type="text"
              placeholder="Pan Number"
              required
              className="w-full px-4 py-2 border rounded-md"
            />
            </div>

          {/* Vehicle Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Vehicle Details
            </h3>
            <select required className="w-full px-4 py-2 border rounded-md">
              <option value="">Vehicle Type</option>
              <option>Bike</option>
              <option>Auto</option>
              <option>Car</option>
            </select>
            <input
              type="text"
              placeholder="Vehicle Model"
              required
              className="w-full px-4 py-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Vehicle Number"
              required
              className="w-full px-4 py-2 border rounded-md"
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Pollution Certificate */}
              <div>
                <p className="mb-2 text-sm font-medium">
                  Pollution Certificate Valid?
                </p>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="pollution"
                      value="yes"
                      required
                      className="w-4 h-4"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="pollution"
                      value="no"
                      required
                      className="w-4 h-4"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              {/* Insurance Valid */}
              <div>
                <p className="mb-2 text-sm font-medium">
                  Insurance Certificate Valid?
                </p>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="insurance"
                      value="yes"
                      required
                      className="w-4 h-4"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="insurance"
                      value="no"
                      required
                      className="w-4 h-4"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          
          {/* Uploads */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Uploads</h3>
            <label className="block">Selfie Photo</label>
            <input type="file" required className="w-full" />

            <label className="block">Vehicle Photos (min 2)</label>
            <input type="file" required className="w-full" />
            <input type="file" required className="w-full" />

            <label className="block">Vehicle Number Plate</label>
            <input type="file" required className="w-full" />

            <label className="block">Aadhaar Card</label>
            <input type="file" required className="w-full" />

            <label className="block">PAN Card</label>
            <input type="file" required className="w-full" />

            <label className="block">Driving License</label>
            <input type="file" required className="w-full" />

            <label className="block">RC Number</label>
            <input type="file" required className="w-full" />

            <label className="block">Insurance Certificate</label>
            <input type="file" required className="w-full" />

            <label className="block">Pollution Certificate</label>
            <input type="file" required className="w-full" />
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-md"
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinCaptainForm;
