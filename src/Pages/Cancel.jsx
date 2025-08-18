import React from 'react';

const Cancel = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-black">Cancellation & Refund Policy</h1>

      <p className="mb-4">
        At <strong>CABINDIA</strong>, we understand that plans may change unexpectedly. To ensure a smooth and stress-free experience, we offer a transparent and customer-friendly cancellation and refund policy — for both riders and captains.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">For Customers (Riders)</h2>
      <ul className="list-disc list-inside space-y-2 mb-4">
        <li>You may <strong>cancel your ride any time</strong> before the captain starts moving toward your location with no charges.</li>
        <li>If the captain is <strong>already en route</strong>, a <strong>nominal cancellation fee</strong> will apply.</li>
        <li>If the captain has <strong>arrived at your pickup location</strong> and the ride is canceled, a higher fee may be charged.</li>
        <li>Refunds (if applicable) will be processed to your <strong>original payment method within 5–7 business days</strong>. Wallet refunds are instant.</li>
        <li>If your ride is canceled due to <strong>unavailability or technical issues</strong>, you’ll receive a <strong>full refund without deductions</strong>.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">For Captains (Drivers)</h2>
      <ul className="list-disc list-inside space-y-2 mb-4">
        <li>Captains may cancel a ride if the customer is unreachable, delays too long, or in case of emergencies.</li>
        <li>Frequent or unjustified cancellations may lead to <strong>temporary deactivation or review</strong> of the captain’s account.</li>
        <li>We encourage captains to maintain a <strong>low cancellation rate</strong> to ensure a reliable experience for all users.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">General Conditions</h2>
      <ul className="list-disc list-inside space-y-2 mb-4">
        <li><strong>CABINDIA</strong> reserves the right to modify this policy at any time without prior notice.</li>
        <li>Disputes will be handled by our support team based on app records and trip data.</li>
        <li>Refund eligibility depends on timing, ride status, and reason for cancellation.</li>
      </ul>

      <p className="mt-6">
        If you have any questions or need further assistance, please contact our customer support team. We're here to help you 24/7.
      </p>
    </div>
  );
};

export default Cancel;
