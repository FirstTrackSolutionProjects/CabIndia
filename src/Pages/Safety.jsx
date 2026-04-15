import React from "react";
import {
  MapPin, ShieldCheck, Headphones, AlertCircle,
  UserCheck, Lock, Zap, Clock
} from "lucide-react";

const stats = [
  { value: "50K+",  label: "Safe Rides Completed" },
  { value: "500+",  label: "Verified Captains"     },
  { value: "< 2min",label: "Avg SOS Response Time" },
  { value: "24/7",  label: "Support Available"     },
];

const features = [
  {
    icon: MapPin,
    title: "Real-Time GPS Tracking",
    desc: "Every ride is tracked live on the map. Share your trip with family or friends for complete peace of mind.",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/20",
    hover: "hover:border-yellow-400/50",
  },
  {
    icon: ShieldCheck,
    title: "Verified Drivers Only",
    desc: "Every CabIndia captain undergoes rigorous background checks, document verification, and safety training before onboarding.",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
    hover: "hover:border-blue-400/50",
  },
  {
    icon: Headphones,
    title: "24/7 Customer Support",
    desc: "Our dedicated support team is available round the clock — call, chat, or raise a complaint any time.",
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
    hover: "hover:border-green-400/50",
  },
  {
    icon: UserCheck,
    title: "Women Safety Features",
    desc: "Women-preferred captain options, live trip sharing, and an emergency SOS button built into every ride.",
    color: "text-pink-400",
    bg: "bg-pink-400/10 border-pink-400/20",
    hover: "hover:border-pink-400/50",
  },
  {
    icon: Lock,
    title: "Data Privacy & Security",
    desc: "Your personal data is fully encrypted. We never share your information with third parties without consent.",
    color: "text-purple-400",
    bg: "bg-purple-400/10 border-purple-400/20",
    hover: "hover:border-purple-400/50",
  },
  {
    icon: Zap,
    title: "Instant Booking Confirmation",
    desc: "Get real-time captain assignment with name, photo, vehicle details, and live location before the ride starts.",
    color: "text-orange-400",
    bg: "bg-orange-400/10 border-orange-400/20",
    hover: "hover:border-orange-400/50",
  },
];

export default function Safety() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* ── HERO ── */}
      <section className="relative px-4 sm:px-8 lg:px-16 pt-20 pb-16 overflow-hidden">
        {/* background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-8 h-px bg-yellow-400" />
            <span className="text-yellow-400 text-[10px] font-bold tracking-[0.25em] uppercase">Your Safety, Our Priority</span>
            <div className="w-8 h-px bg-yellow-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-5">
            Committed to Your{" "}
            <span className="text-yellow-400 italic">Safety</span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            From real-time GPS tracking to verified drivers and an emergency SOS button —
            every CabIndia ride is built around keeping you safe, every single trip.
          </p>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="px-4 sm:px-8 lg:px-16 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div key={i}
                className="flex flex-col items-center justify-center text-center bg-gray-900 border border-gray-800 rounded-2xl py-6 px-4 gap-1 hover:border-yellow-400/30 transition-all duration-300">
                <span className="text-3xl font-black text-yellow-400 tracking-tight leading-none">
                  {s.value}
                </span>
                <span className="text-gray-500 text-xs font-semibold tracking-wide mt-1">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* yellow separator */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />
      </div>

      {/* ── FEATURES GRID ── */}
      <section className="px-4 sm:px-8 lg:px-16 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-8 h-px bg-yellow-400" />
              <span className="text-yellow-400 text-[10px] font-bold tracking-[0.25em] uppercase">What We Do</span>
              <div className="w-8 h-px bg-yellow-400" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white">
              Safety <span className="text-yellow-400 italic">Features</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i}
                  className={`group flex flex-col gap-4 bg-gray-900 border rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] ${f.hover}`}
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${f.bg} ${f.color} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={19} strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3 className="text-white text-sm font-bold leading-snug mb-1.5">{f.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* yellow separator */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />
      </div>

      {/* ── SOS HIGHLIGHT ── */}
      <section className="px-4 sm:px-8 lg:px-16 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gray-900 border border-red-500/20 rounded-3xl p-8 md:p-10 overflow-hidden">

            {/* glow */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-red-500/8 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">

              {/* SOS icon */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                  <AlertCircle size={36} className="text-red-400" strokeWidth={1.8} />
                </div>
              </div>

              {/* text */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-red-400 uppercase">Emergency Feature</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight mb-3">
                  One Tap <span className="text-red-400 italic">SOS</span> Button
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
                  In any emergency during a ride, press the SOS button to instantly alert our
                  safety team and your emergency contacts with your live location. Help is always
                  just one tap away — available 24 hours, every day of the year.
                </p>

                {/* quick info pills */}
                <div className="flex flex-wrap gap-2 mt-5">
                  {[
                    { icon: Clock, text: "Avg. 2 min response" },
                    { icon: MapPin, text: "Live location shared" },
                    { icon: Headphones, text: "Safety team alerted" },
                  ].map((p, i) => {
                    const PIcon = p.icon;
                    return (
                      <span key={i} className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-300 text-[11px] font-semibold px-3 py-1.5 rounded-full">
                        <PIcon size={11} /> {p.text}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM NOTE ── */}
      <section className="px-4 sm:px-8 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/15 to-transparent mb-10" />
          <p className="text-center text-gray-700 text-xs tracking-wide leading-relaxed">
            CabIndia is committed to continuous safety improvements. If you have a safety concern,{" "}
            <a href="/contact" className="text-yellow-400 hover:text-yellow-300 transition-colors font-semibold">
              contact our team
            </a>{" "}
            anytime — we're always listening.
          </p>
        </div>
      </section>

    </div>
  );
}