import React, { useState } from "react";

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="border rounded-md p-4 mb-3 shadow-sm cursor-pointer bg-white hover:bg-gray-50 transition"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">{question}</h3>
        <span className="text-xl">{isOpen ? "▲" : "▼"}</span>
      </div>
      {isOpen && <p className="text-gray-700 mt-2">{answer}</p>}
    </div>
  );
};

const Faq = () => {
  const faqData = [
    {
      question: "How do I book a ride?",
      answer:
        "Simply enter your pickup and drop location on the booking page, choose your preferred ride type (bike, auto, cab), and confirm your ride.",
    },
    {
      question: "What payment options are available?",
      answer:
        "We accept UPI, credit/debit cards, net banking, and wallet payments. Cash on delivery may be available for select locations.",
    },
    {
      question: "Can I schedule a ride for later?",
      answer:
        "Yes, you can schedule a ride in advance by selecting the date and time during booking. We will remind you before the scheduled time.",
    },
    {
      question: "What if my driver cancels the ride?",
      answer:
        "If your driver cancels, you will be notified instantly, and we’ll assign another nearby driver without any extra cost.",
    },
    {
      question: "Is customer support available 24/7?",
      answer:
        "Absolutely! You can reach our support team via chat, email, or phone anytime for quick assistance regarding bookings or issues.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
      {faqData.map((faq, idx) => (
        <FAQItem key={idx} question={faq.question} answer={faq.answer} />
      ))}
    </div>
  );
};

export default Faq;
