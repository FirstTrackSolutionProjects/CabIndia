import React from "react";
import { UserX, Car, AlertCircle, HeadphonesIcon } from "lucide-react";

const sections = [
  {
    id: "customers",
    icon: UserX,
    title: "For Customers (Riders)",
    items: [
      "You may cancel your ride any time before the captain starts moving toward your location with no charges.",
      "If the captain is already en route, a nominal cancellation fee will apply.",
      "If the captain has arrived at your pickup location and the ride is canceled, a higher fee may be charged.",
      "Refunds (if applicable) will be processed to your original payment method within 5–7 business days. Wallet refunds are instant.",
      "If your ride is canceled due to unavailability or technical issues, you'll receive a full refund without any deductions.",
    ],
  },
  {
    id: "captains",
    icon: Car,
    title: "For Captains (Drivers)",
    items: [
      "Captains may cancel a ride if the customer is unreachable, delays too long, or in case of emergencies.",
      "Frequent or unjustified cancellations may lead to temporary deactivation or review of the captain's account.",
      "We encourage captains to maintain a low cancellation rate to ensure a reliable experience for all users.",
    ],
  },
  {
    id: "general",
    icon: AlertCircle,
    title: "General Conditions",
    items: [
      "CabIndia reserves the right to modify this policy at any time without prior notice.",
      "Disputes will be handled by our support team based on app records and trip data.",
      "Refund eligibility depends on timing, ride status, and reason for cancellation.",
    ],
  },
];

const refundTable = [
  { timing: "Before captain departs",    fee: "No charge",   refund: "Full refund" },
  { timing: "Captain already en route",  fee: "Nominal fee", refund: "Partial refund" },
  { timing: "Captain arrived at pickup", fee: "Higher fee",  refund: "Partial / none" },
  { timing: "Platform / tech issue",     fee: "No charge",   refund: "Full refund" },
];

export default function Cancel() {
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
            Cancellation &{" "}
            <span className="text-yellow-400 italic">Refund</span> Policy
          </h1>
          <p className="text-gray-500 text-sm mt-4 max-w-xl mx-auto leading-relaxed">
            We understand plans change. Our policy is designed to be transparent
            and fair — for both riders and captains.
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
            At <span className="text-white font-semibold">CabIndia</span>, we offer a transparent
            and customer-friendly cancellation and refund policy — for both{" "}
            <span className="text-white font-semibold">riders</span> and{" "}
            <span className="text-white font-semibold">captains</span>. Please review the
            conditions below before canceling any booking.
          </p>
        </div>
      </div>

      {/* ── Quick Reference Table ── */}
      <div className="max-w-4xl mx-auto px-6 mt-8">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 overflow-hidden">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-5 h-px bg-yellow-400" />
            <span className="text-yellow-400 text-[10px] font-bold tracking-[0.2em] uppercase">
              Quick Reference
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-[10px] font-bold tracking-[0.15em] text-gray-500 uppercase pb-3 pr-6">
                    Cancellation Timing
                  </th>
                  <th className="text-left text-[10px] font-bold tracking-[0.15em] text-gray-500 uppercase pb-3 pr-6">
                    Fee
                  </th>
                  <th className="text-left text-[10px] font-bold tracking-[0.15em] text-gray-500 uppercase pb-3">
                    Refund
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {refundTable.map((row, i) => (
                  <tr key={i} className="group">
                    <td className="py-3 pr-6 text-gray-300 group-hover:text-white transition-colors">{row.timing}</td>
                    <td className="py-3 pr-6">
                      <span className={[
                        "text-xs font-bold px-2.5 py-1 rounded-full",
                        row.fee === "No charge"
                          ? "bg-green-400/10 text-green-400"
                          : row.fee === "Nominal fee"
                          ? "bg-yellow-400/10 text-yellow-400"
                          : "bg-red-400/10 text-red-400",
                      ].join(" ")}>
                        {row.fee}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400 text-xs">{row.refund}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Sections ── */}
      <div className="max-w-4xl mx-auto px-6 mt-6 flex flex-col gap-6">
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
                  <span className="text-gray-700 text-xs font-black tracking-widest">0{si + 1}</span>
                  <div className="w-4 h-px bg-gray-700" />
                  <h2 className="text-lg font-black text-white tracking-tight">{section.title}</h2>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-yellow-400/20 via-gray-800 to-transparent mb-6" />

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

      {/* ── Support CTA ── */}
      <div className="max-w-4xl mx-auto px-6 mt-6">
        <div className="bg-gray-900 border border-yellow-400/20 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden">
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-yellow-400/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 flex-shrink-0">
              <HeadphonesIcon size={18} strokeWidth={2} />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Need help with a cancellation?</p>
              <p className="text-gray-500 text-xs mt-0.5">Our support team is available 24/7 to assist you.</p>
            </div>
          </div>
          <a
            href="mailto:support@cabindia.in"
            className="flex-shrink-0 flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-black text-xs px-5 py-2.5 rounded-xl transition-all active:scale-95 shadow-[0_4px_16px_rgba(250,204,21,0.25)]"
          >
            Contact Support
          </a>
        </div>
      </div>

      {/* ── Footer note ── */}
      <div className="max-w-4xl mx-auto px-6 mt-8">
        <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent mb-6" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-gray-600 text-xs leading-relaxed max-w-md">
            For disputes or refund queries, reach us at{" "}
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