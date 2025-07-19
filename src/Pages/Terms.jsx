import React from 'react';

const Terms = () => {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-4">Terms & Conditions</h2>

      <p className="text-gray-700 mb-4">
        By accessing or using our platform, whether as a customer or captain (driver), you agree to comply with these Terms & Conditions. If you do not agree with any part of these terms, please do not use our services.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-2">General Terms</h3>
      <ul className="list-disc pl-6 text-gray-700 space-y-2">
        <li>All bookings are subject to availability, confirmation, and service location. Pricing may vary based on distance, demand, time, and type of service selected.</li>
        <li>We reserve the right to modify, suspend, or discontinue any service or feature at any time without notice. Continued usage implies acceptance of such changes.</li>
        <li>Any misuse of the platform including false bookings, harassment, or unlawful conduct will result in permanent suspension and may involve legal consequences.</li>
      </ul>

      <h3 className="text-xl font-semibold mt-6 mb-2">For Customers</h3>
      <ul className="list-disc pl-6 text-gray-700 space-y-2">
        <li>Customers must provide accurate personal and payment information while booking rides.</li>
        <li>Customers must treat captains with respect and avoid any abusive, threatening, or inappropriate behavior.</li>
        <li>In the event of cancellation or no-show, applicable charges may be levied as per our cancellation policy.</li>
        <li>Riders are responsible for any damage caused to the vehicle during the ride.</li>
      </ul>

      <h3 className="text-xl font-semibold mt-6 mb-2">For Captains (Drivers)</h3>
      <ul className="list-disc pl-6 text-gray-700 space-y-2">
        <li>Captains must hold valid government-issued licenses, permits, and vehicle insurance.</li>
        <li>Captains must comply with local traffic laws and ensure passenger safety throughout the ride.</li>
        <li>Any inappropriate behavior, harassment, or intoxication while on duty is strictly prohibited.</li>
        <li>Captains must maintain a clean and well-functioning vehicle and be punctual for every ride.</li>
        <li>All rides must be accepted through the official platform; side arrangements or fare manipulation may result in termination.</li>
      </ul>

      <h3 className="text-xl font-semibold mt-6 mb-2">Legal & Liability</h3>
      <ul className="list-disc pl-6 text-gray-700 space-y-2">
        <li>We are not liable for personal belongings left behind in the vehicle. Please check before exiting.</li>
        <li>We may share user data with legal authorities in the event of disputes, crime, or fraud investigations.</li>
        <li>Your continued use of the platform constitutes acceptance of these terms, including any updates or changes posted on our site.</li>
      </ul>
    </div>
  );
};

export default Terms;
