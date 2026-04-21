import React from "react";
import { Database, BarChart2, Share2, Lock, UserCheck, Cookie, RefreshCw, Mail } from "lucide-react";

const sections = [
  {
    id: "collect",
    icon: Database,
    title: "Information We Collect",
    intro: "We collect information that helps us deliver and improve our services. This includes:",
    items: [
      "Name, contact number, and email address during registration.",
      "Location data for ride booking and real-time tracking.",
      "Payment information when transactions are made on the platform.",
      "Device and browser data to enhance app performance and security.",
    ],
  },
  {
    id: "use",
    icon: BarChart2,
    title: "How We Use Your Information",
    intro: "The data we collect is used to:",
    items: [
      "Facilitate ride bookings, confirmations, and live service updates.",
      "Improve user experience and overall app performance.",
      "Provide personalized offers, notifications, and customer support.",
      "Ensure safety, fraud prevention, and compliance with legal obligations.",
    ],
  },
  {
    id: "sharing",
    icon: Share2,
    title: "Data Sharing & Disclosure",
    intro: null,
    items: [
      "We never sell your personal data to third parties under any circumstances.",
      "We may share data with trusted partners only to the extent necessary for providing services — such as payment gateways and customer support tools.",
      "We comply fully with legal requirements if data disclosure is officially mandated by law enforcement or regulatory authorities.",
    ],
  },
  {
    id: "security",
    icon: Lock,
    title: "Data Security",
    intro: null,
    items: [
      "We implement industry-standard encryption across all data transmissions.",
      "Our servers are secured with restricted access policies and regular audits.",
      "Your data is protected against unauthorized access, loss, alteration, or misuse at all times.",
    ],
  },
  {
    id: "rights",
    icon: UserCheck,
    title: "Your Rights",
    intro: null,
    items: [
      "You have the right to access, modify, or delete your personal information at any time.",
      "You may opt out of promotional communications using the unsubscribe option in our emails.",
      "To exercise any of your data rights, contact us at support@cabindia.in.",
    ],
  },
  {
    id: "cookies",
    icon: Cookie,
    title: "Cookies & Tracking",
    intro: null,
    items: [
      "Our website and app use cookies to enhance user experience and remember your preferences.",
      "Anonymous usage statistics are collected to help us improve our services.",
      "You can disable cookies at any time through your browser or device settings.",
    ],
  },
  {
    id: "updates",
    icon: RefreshCw,
    title: "Updates to This Policy",
    intro: null,
    items: [
      "We may occasionally update this Privacy Policy to reflect changes in technology or legal requirements.",
      "Significant changes will be communicated via email or an in-app notification.",
      "We encourage you to review this page regularly to stay informed.",
    ],
  },
  {
    id: "contact",
    icon: Mail,
    title: "Contact Us",
    intro: null,
    items: [
      "If you have any questions or concerns regarding our privacy practices, our team is ready to help.",
      "Reach us at: support@cabindia.in — we aim to respond within 48 hours.",
    ],
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20">

      {/* ── Hero ── */}
      <div className="relative w-full bg-gray-900 border-b border-gray-800 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(250,204,21,0.8) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(250,204,21,0.8) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-yellow-400/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />

        <div className="max-w-4xl mx-auto px-6 py-16 relative z-10 text-center">
          <span className="text-[10px] font-bold tracking-[0.25em] text-yellow-400/70 uppercase mb-3 block">
            CabIndia · Legal
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Privacy{" "}
            <span className="text-yellow-400 italic">Policy</span>
          </h1>
          <p className="text-gray-500 text-sm mt-4 max-w-xl mx-auto leading-relaxed">
            Your privacy is our priority. This policy outlines how we collect,
            use, and protect your personal information on the CabIndia platform.
          </p>
          <div className="flex items-center justify-center gap-2 mt-5">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            
          </div>
        </div>
      </div>

      {/* ── Intro strip ── */}
      <div className="max-w-4xl mx-auto px-6 mt-12">
        <div className="bg-yellow-400/5 border border-yellow-400/15 rounded-2xl px-6 py-5">
          <p className="text-gray-400 text-sm leading-relaxed">
            At <span className="text-white font-bold">CabIndia</span>, we believe in full
            transparency and integrity in how we handle your data. This Privacy Policy applies
            to all users — customers and captains — across our website, app, and services.
          </p>
        </div>
      </div>

      {/* ── Sections ── */}
      <div className="max-w-4xl mx-auto px-6 mt-10 flex flex-col gap-6">
        {sections.map((section, si) => {
          const Icon = section.icon;
          return (
            <div
              key={section.id}
              id={section.id}
              className="bg-gray-900 border border-gray-800 hover:border-yellow-400/25 rounded-3xl p-6 md:p-8 relative overflow-hidden group transition-all duration-300"
            >
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-yellow-400/0 group-hover:bg-yellow-400/5 rounded-full blur-2xl transition-all duration-500 pointer-events-none" />

              {/* header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 flex-shrink-0 group-hover:bg-yellow-400 group-hover:text-gray-950 transition-all duration-300">
                  <Icon size={18} strokeWidth={2} />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-700 text-xs font-black tracking-widest">
                    {String(si + 1).padStart(2, "0")}
                  </span>
                  <div className="w-4 h-px bg-gray-700" />
                  <h2 className="text-lg font-black text-white tracking-tight">{section.title}</h2>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-yellow-400/20 via-gray-800 to-transparent mb-6" />

              {/* optional intro line */}
              {section.intro && (
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">{section.intro}</p>
              )}

              {/* items */}
              <ul className="flex flex-col gap-4">
                {section.items.map((item, ii) => (
                  <li key={ii} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    </span>
                    <p className="text-gray-400 text-sm leading-relaxed">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* ── Closing quote ── */}
      <div className="max-w-4xl mx-auto px-6 mt-8">
        <div className="relative pl-5 border-l-2 border-yellow-400/50 py-1">
          <p className="text-white text-base font-semibold italic leading-relaxed">
            "Your trust drives us.{" "}
            <span className="text-yellow-400">Thank you for choosing CabIndia.</span>"
          </p>
        </div>
      </div>

      {/* ── Footer note ── */}
      <div className="max-w-4xl mx-auto px-6 mt-8">
        <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent mb-6" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-gray-600 text-xs leading-relaxed max-w-md">
            Questions about your privacy? Reach us at{" "}
            <span className="text-yellow-400 font-semibold">support@cabindia.in</span>
          </p>
          <span className="text-gray-700 text-[10px] tracking-widest uppercase font-bold whitespace-nowrap">
            © 2025 CabIndia
          </span>
        </div>
      </div>
    </div>
  );
}