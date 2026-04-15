import React from "react";
import { ShieldCheck, Users, Car, Scale, AlertTriangle } from "lucide-react";

const sections = [
  {
    icon: ShieldCheck,
    title: "General Terms",
    id: "general",
    items: [
      "All bookings are subject to availability, confirmation, and service location. Pricing may vary based on distance, demand, time, and type of service selected.",
      "We reserve the right to modify, suspend, or discontinue any service or feature at any time without notice. Continued usage implies acceptance of such changes.",
      "Any misuse of the platform including false bookings, harassment, or unlawful conduct will result in permanent suspension and may involve legal consequences.",
    ],
  },
  {
    icon: Users,
    title: "For Customers",
    id: "customers",
    items: [
      "Customers must provide accurate personal and payment information while booking rides.",
      "Customers must treat captains with respect and avoid any abusive, threatening, or inappropriate behavior.",
      "In the event of cancellation or no-show, applicable charges may be levied as per our cancellation policy.",
      "Riders are responsible for any damage caused to the vehicle during the ride.",
    ],
  },
  {
    icon: Car,
    title: "For Captains",
    id: "captains",
    items: [
      "Captains must hold valid government-issued licenses, permits, and vehicle insurance.",
      "Captains must comply with local traffic laws and ensure passenger safety throughout the ride.",
      "Any inappropriate behavior, harassment, or intoxication while on duty is strictly prohibited.",
      "Captains must maintain a clean and well-functioning vehicle and be punctual for every ride.",
      "All rides must be accepted through the official platform — side arrangements or fare manipulation may result in termination.",
    ],
  },
  {
    icon: Scale,
    title: "Legal & Liability",
    id: "legal",
    items: [
      "We are not liable for personal belongings left behind in the vehicle. Please check before exiting.",
      "We may share user data with legal authorities in the event of disputes, crime, or fraud investigations.",
      "Your continued use of the platform constitutes acceptance of these terms, including any updates or changes posted on our site.",
    ],
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20">

      {/* ── Hero ── */}
      <div className="relative w-full bg-gray-900 border-b border-gray-800 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(250,204,21,0.8) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(250,204,21,0.8) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-yellow-400/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />

        <div className="max-w-4xl mx-auto px-6 py-16 text-center relative z-10">
          <p className="text-[10px] font-bold tracking-[0.25em] text-yellow-400/60 uppercase mb-3">
            CabIndia · Legal
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Terms &{" "}
            <span className="text-yellow-400 italic">Conditions</span>
          </h1>
          <p className="text-gray-500 text-sm mt-4 max-w-xl mx-auto leading-relaxed">
            By accessing or using CabIndia, whether as a customer or captain, you agree to comply with these terms. Please read them carefully before using our services.
          </p>
          <div className="flex items-center justify-center gap-2 mt-5">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/50" />
            <span className="text-gray-600 text-xs font-mono tracking-wide">
              Last updated: April 11, 2026
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/50" />
          </div>
        </div>
      </div>

      {/* ── Acceptance notice ── */}
      <div className="max-w-4xl mx-auto px-6 mt-10">
        <div className="flex items-start gap-4 bg-yellow-400/5 border border-yellow-400/20 rounded-2xl p-5">
          <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-yellow-400/80 text-sm leading-relaxed">
            <span className="font-bold text-yellow-400">Important: </span>
            If you do not agree with any part of these terms, please discontinue use of our platform immediately. Continued use constitutes full acceptance.
          </p>
        </div>
      </div>

      {/* ── Sections ── */}
      <div className="max-w-4xl mx-auto px-6 mt-10 flex flex-col gap-6">
        {sections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <div
              key={section.id}
              id={section.id}
              className="bg-gray-900 border border-gray-800 hover:border-yellow-400/20 rounded-3xl p-7 transition-all duration-300 group"
            >
              {/* header */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 group-hover:bg-yellow-400 group-hover:text-gray-950 transition-all duration-300 flex-shrink-0">
                  <Icon size={18} strokeWidth={2} />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-yellow-400/40 font-mono tracking-widest">
                    0{idx + 1}
                  </span>
                  <h2 className="text-lg font-black tracking-tight text-white">
                    {section.title}
                  </h2>
                </div>
              </div>

              {/* divider */}
              <div className="h-px bg-gradient-to-r from-yellow-400/15 via-gray-700 to-transparent mb-5" />

              {/* items */}
              <ul className="flex flex-col gap-4">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-yellow-400/50 flex-shrink-0" />
                    <p className="text-gray-400 text-sm leading-relaxed">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* ── Footer note ── */}
      <div className="max-w-4xl mx-auto px-6 mt-12">
        <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/15 to-transparent mb-8" />
        <div className="text-center flex flex-col gap-2">
          <p className="text-gray-600 text-xs">
            Questions about these terms? Reach us at{" "}
            <span className="text-yellow-400 font-semibold">support@cabindia.in</span>
          </p>
          <p className="text-gray-700 text-[11px]">© 2026 CabIndia. All rights reserved.</p>
        </div>
      </div>

    </div>
  );
} 