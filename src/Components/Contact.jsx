import React, { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from "lucide-react";

// Add these imports here:
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import sendContactUs from "../services/contact/send_contact_us.contact.service";

const contactInfo = [
  {
    icon: Phone,
    label: "Call Us",
    value: "+91 98765 43210",
    sub: "Available 24/7 for support",
  },
  {
    icon: Mail,
    label: "Email Us",
    value: "support@cabindia.in",
    sub: "We reply within 2 hours",
  },
  {
    icon: MapPin,
    label: "Head Office",
    value: "Bhubaneswar, Odisha",
    sub: " Saheed Nagar",
  },
  {
    icon: Clock,
    label: "Working Hours",
    value: "24 × 7 × 365",
    sub: "Always here for you",
  },
];

export default function ContactPage() {
  const INITIAL_CONTACT_FORM_STATE = Object.freeze({
    name: "",
    phone: "",
    email: "",
    message: "",
  })
  const [form, setForm] = useState(INITIAL_CONTACT_FORM_STATE);
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState("");
  
  // 1. Uncomment the loading state
  const [loading, setLoading] = useState(false);
 
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    try {
      setLoading(true);
      
      // 2. Use 'form' instead of 'formData', as that is your active state variable
      // Note: Ensure `sendContactUs` is imported at the top of your file!
      await sendContactUs(form); //send actual form data to backend
      
      // 3. Trigger your success UI by setting submitted to true 
      // (This replaces the commented out setFormData logic)
      setSubmitted(true); 
      
      // Note: Ensure `toast` is imported (e.g., from 'react-hot-toast' or 'react-toastify')
      toast.success("Message sent successfully");
    } catch (error) {
      console.error(error.message || "Something Went Wrong");
      toast.error(error.message || "Failed to send message")
    } finally {
      setLoading(false); //finally block ensures loading is reset regardless of success or failure(alwaye executed with try and catch block)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* ── HERO BANNER ── */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden">
        {/* image */}
        <img
          src="/images/contact.jpg"
          alt="Contact CabIndia"
          className="w-full h-full object-cover object-center"
          onError={(e) => { e.target.style.display = "none"; }}
        />

        {/* dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-gray-950/50 to-gray-950" />

        {/* diagonal yellow accent bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-400"
          style={{ boxShadow: "0 0 40px 4px rgba(250,204,21,0.5)" }}
        />

        {/* Hero text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <span className="text-xs font-bold tracking-[0.3em] text-yellow-400 uppercase mb-3">
            CabIndia Support
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
            Get In{" "}
            <span className="text-yellow-400 italic">Touch</span>
          </h1>
          <p className="mt-3 text-white text-sm md:text-base max-w-md">
            Our team is available round the clock — for rides, partnerships, or just a hello.
          </p>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* ── LEFT — Contact Info ── */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            <div>
              <h2 className="text-2xl font-black tracking-tight">
                We're always{" "}
                <span className="text-yellow-400">reachable</span>
              </h2>
              <p className="text-white text-sm mt-2 leading-relaxed">
                Whether you have a complaint, a suggestion, or a business inquiry —
                drop us a message and we'll get back to you fast.
              </p>
            </div>

            {/* info cards */}
            <div className="flex flex-col gap-3">
              {contactInfo.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-start gap-4 bg-gray-900 border border-gray-800 hover:border-yellow-400/40 rounded-2xl p-4 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center flex-shrink-0 text-yellow-400 group-hover:bg-yellow-400 group-hover:text-white transition-all duration-300">
                      <Icon size={17} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.15em] text-white uppercase">
                        {item.label}
                      </p>
                      <p className="text-sm font-bold text-white mt-0.5">{item.value}</p>
                      <p className="text-[11px] text-white mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* decorative strip */}
            <div className="mt-2 rounded-2xl bg-yellow-400/5 border border-yellow-400/15 p-5">
              <p className="text-yellow-400 font-black text-lg leading-tight">
                "Your ride, your way —<br />
                <span className="text-white">always on time."</span>
              </p>
              <p className="text-white text-xs mt-2">— CabIndia Promise</p>
            </div>
          </div>

          {/* ── RIGHT — Form ── */}
          <div className="lg:col-span-3">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 relative overflow-hidden">

              {/* corner glow */}
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-yellow-400/8 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-yellow-400/5 rounded-full blur-2xl pointer-events-none" />

              {!submitted ? (
                <>
                  <div className="mb-6">
                    <h3 className="text-xl font-black tracking-tight">
                      Send us a{" "}
                      <span className="text-yellow-400">message</span>
                    </h3>
                    <p className="text-white text-xs mt-1">
                      Fill in the details below and we'll respond ASAP.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    {/* Name + Email row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold tracking-[0.15em] text-white uppercase">
                          Your Name
                        </label>
                        <div
                          className={[
                            "flex items-center bg-gray-800 rounded-xl border transition-all duration-200 overflow-hidden",
                            focused === "name"
                              ? "border-yellow-400 shadow-[0_0_0_3px_rgba(250,204,21,0.12)]"
                              : "border-gray-700",
                          ].join(" ")}
                        >
                          <input
                            type="text"
                            name="name"
                            required
                            placeholder="Arjun Sharma"
                            value={form.name}
                            onChange={handleChange}
                            onFocus={() => setFocused("name")}
                            onBlur={() => setFocused("")}
                            className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-gray-600 outline-none"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold tracking-[0.15em] text-white uppercase">
                          Email Address
                        </label>
                        <div
                          className={[
                            "flex items-center bg-gray-800 rounded-xl border transition-all duration-200",
                            focused === "email"
                              ? "border-yellow-400 shadow-[0_0_0_3px_rgba(250,204,21,0.12)]"
                              : "border-gray-700",
                          ].join(" ")}
                        >
                          <input
                            type="email"
                            name="email"
                            required
                            placeholder="you@email.com"
                            value={form.email}
                            onChange={handleChange}
                            onFocus={() => setFocused("email")}
                            onBlur={() => setFocused("")}
                            className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-gray-600 outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold tracking-[0.15em] text-white uppercase">
                        Phone Number
                      </label>
                      <div
                        className={[
                          "flex items-center bg-gray-800 rounded-xl border transition-all duration-200 overflow-hidden",
                          focused === "phone"
                            ? "border-yellow-400 shadow-[0_0_0_3px_rgba(250,204,21,0.12)]"
                            : "border-gray-700",
                        ].join(" ")}
                      >
                        <span className="flex items-center gap-1.5 px-3 border-r border-gray-700 text-xs font-bold text-white h-full py-3 bg-gray-800/80 flex-shrink-0">
                          🇮🇳 +91
                        </span>
                        <input
                          type="tel"
                          name="phone"
                          placeholder="98765 43210"
                          value={form.phone}
                          onChange={handleChange}
                          onFocus={() => setFocused("phone")}
                          onBlur={() => setFocused("")}
                          className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-gray-600 outline-none"
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold tracking-[0.15em] text-white uppercase">
                        Message
                      </label>
                      <div
                        className={[
                          "bg-gray-800 rounded-xl border transition-all duration-200",
                          focused === "message"
                            ? "border-yellow-400 shadow-[0_0_0_3px_rgba(250,204,21,0.12)]"
                            : "border-gray-700",
                        ].join(" ")}
                      >
                        <textarea
                          name="message"
                          required
                          rows={4}
                          placeholder="Tell us how we can help you..."
                          value={form.message}
                          onChange={handleChange}
                          onFocus={() => setFocused("message")}
                          onBlur={() => setFocused("")}
                          className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-gray-600 outline-none resize-none rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-white font-black text-sm tracking-wide py-4 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-[0_4px_24px_rgba(250,204,21,0.3)] hover:shadow-[0_6px_32px_rgba(250,204,21,0.45)] mt-1 group relative overflow-hidden"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 pointer-events-none" />
                      <Send size={16} />
                      {loading ? "Sending..." : "Send Message"}
                    </button>

                  </form>
                </>
              ) : (
                /* ── Success State ── */
                <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-yellow-400/15 border border-yellow-400/30 flex items-center justify-center text-yellow-400">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">
                    Message <span className="text-yellow-400">Sent!</span>
                  </h3>
                  <p className="text-white text-sm max-w-xs leading-relaxed">
                    Thanks for reaching out. Our team will get back to you within 2 hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", message: "" }); }}
                    className="mt-2 px-6 py-2.5 rounded-xl border border-yellow-400/30 text-yellow-400 text-sm font-bold hover:bg-yellow-400/10 transition-all"
                  >
                    Send Another
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}