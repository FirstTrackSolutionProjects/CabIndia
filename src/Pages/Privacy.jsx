import React from 'react';

const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-800">
      <h2 className="text-3xl font-bold mb-6">Privacy Policy</h2>

      <p className="mb-4">
        At <strong>CABINDIA</strong>, your privacy is our priority. We believe in transparency and integrity when it comes to how we collect, use, and protect your personal information. This Privacy Policy outlines our practices regarding your data and your rights concerning it.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h3>
      <p className="mb-4">
        We collect information that helps us deliver and improve our services. This includes:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>Name, contact number, and email address during registration</li>
        <li>Location data for ride booking and tracking</li>
        <li>Payment information when transactions are made</li>
        <li>Device and browser data to enhance performance</li>
      </ul>

      <h3 className="text-xl font-semibold mt-6 mb-2">2. How We Use Your Information</h3>
      <p className="mb-4">
        The data we collect is used to:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>Facilitate ride bookings and service updates</li>
        <li>Improve user experience and app performance</li>
        <li>Provide personalized offers and customer support</li>
        <li>Ensure safety and compliance with legal obligations</li>
      </ul>

      <h3 className="text-xl font-semibold mt-6 mb-2">3. Data Sharing & Disclosure</h3>
      <p className="mb-4">
        We never sell your data to third parties. We may share data with trusted partners only to the extent necessary for providing our services (e.g., payment gateways, customer support tools). We also comply with legal requirements if data disclosure is mandated.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-2">4. Data Security</h3>
      <p className="mb-4">
        We implement industry-standard encryption, secure servers, and restricted access policies to safeguard your data against unauthorized access, loss, or misuse.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-2">5. Your Rights</h3>
      <p className="mb-4">
        You have the right to access, modify, or delete your personal information at any time. You may also opt out of promotional communications by using the unsubscribe option in our emails.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-2">6. Cookies & Tracking</h3>
      <p className="mb-4">
        Our website and app use cookies to enhance user experience, remember your preferences, and collect anonymous usage statistics. You can disable cookies in your browser settings.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-2">7. Updates to This Policy</h3>
      <p className="mb-4">
        We may occasionally update our Privacy Policy to reflect changes in technology, legal requirements, or our services. We encourage you to review this page regularly.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-2">8. Contact Us</h3>
      <p className="mb-4">
        If you have any questions or concerns regarding our privacy practices, feel free to reach out to us at: <strong>support@cabindia.com</strong>.
      </p>

      <p className="mt-6 italic">Your trust drives us. Thank you for choosing CABINDIA.</p>
    </div>
  );
};

export default Privacy;
