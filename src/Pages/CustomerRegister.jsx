import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus, ArrowRight, Check } from "lucide-react";

export default function CustomerRegister() {
  const navigate = useNavigate();
  const [showPwd,  setShowPwd]  = useState(false);
  const [showCPwd, setShowCPwd] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", cpassword: "",
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-5 text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-yellow-400/15 border-2 border-yellow-400/40 flex items-center justify-center text-yellow-400">
            <Check size={36} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            Welcome to{" "}
            <span className="text-yellow-400 italic">CabIndia!</span>
          </h2>
          <p className="text-white text-sm leading-relaxed">
            Your account has been created successfully.{" "}
            <span className="text-white font-semibold">Login to book your first ride.</span>
          </p>
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-black text-sm px-6 py-3 rounded-xl transition-all active:scale-95 shadow-[0_4px_20px_rgba(250,204,21,0.3)]"
          >
            Go to Login <ArrowRight size={15} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes gridMove {
          from { transform: translateY(0); }
          to   { transform: translateY(40px); }
        }
        .card-anim { animation: fadeUp 0.5s cubic-bezier(0.34,1.1,0.64,1) forwards; }
        .grid-bg   { animation: gridMove 8s linear infinite alternate; }
      `}</style>

      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">

        {/* background grid */}
        <div className="grid-bg absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(250,204,21,0.8) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(250,204,21,0.8) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* glow orbs */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-yellow-400/4 rounded-full blur-3xl pointer-events-none" />

        {/* card */}
        <div className="card-anim relative w-full max-w-md z-10">

          {/* yellow top bar */}
          <div className="h-1 w-full rounded-t-3xl bg-yellow-400"
            style={{ boxShadow: "0 0 24px 4px rgba(250,204,21,0.4)" }} />

          <div className="bg-gray-900 border border-gray-800 border-t-0 rounded-b-3xl px-8 py-10 relative overflow-hidden">

            <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400/6 rounded-full blur-2xl pointer-events-none" />

            {/* header */}
            <div className="flex flex-col items-center gap-3 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-yellow-400/10 border border-yellow-400/25 flex items-center justify-center text-yellow-400">
                <UserPlus size={24} strokeWidth={1.8} />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold tracking-[0.25em] text-yellow-400/60 uppercase mb-1">CabIndia</p>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Create an <span className="text-yellow-400 italic">Account</span>
                </h1>
                <p className="text-white text-xs mt-1.5">Register as a customer to book rides</p>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-7" />

            {/* form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-[0.15em] text-white uppercase">
                  Full Name <span className="text-yellow-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Arjun Sharma"
                  value={form.name}
                  onChange={set("name")}
                  className="w-full bg-gray-800 border border-gray-700 focus:border-yellow-400/60 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(250,204,21,0.08)]"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-[0.15em] text-white uppercase">
                  Email <span className="text-yellow-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={set("email")}
                  className="w-full bg-gray-800 border border-gray-700 focus:border-yellow-400/60 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(250,204,21,0.08)]"
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-[0.15em] text-white uppercase">
                  Phone Number <span className="text-yellow-400">*</span>
                </label>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1.5 px-3 bg-gray-800 border border-gray-700 rounded-xl text-xs text-white font-bold whitespace-nowrap flex-shrink-0">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="98765 43210"
                    value={form.phone}
                    onChange={set("phone")}
                    className="w-full bg-gray-800 border border-gray-700 focus:border-yellow-400/60 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(250,204,21,0.08)]"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-[0.15em] text-white uppercase">
                  Create Password <span className="text-yellow-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    required
                    placeholder="Min 8 characters"
                    value={form.password}
                    onChange={set("password")}
                    className="w-full bg-gray-800 border border-gray-700 focus:border-yellow-400/60 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-gray-600 outline-none transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(250,204,21,0.08)]"
                  />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-white transition-colors">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-[0.15em] text-white uppercase">
                  Confirm Password <span className="text-yellow-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCPwd ? "text" : "password"}
                    required
                    placeholder="Repeat password"
                    value={form.cpassword}
                    onChange={set("cpassword")}
                    className="w-full bg-gray-800 border border-gray-700 focus:border-yellow-400/60 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-gray-600 outline-none transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(250,204,21,0.08)]"
                  />
                  <button type="button" onClick={() => setShowCPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-white transition-colors">
                    {showCPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-black text-sm tracking-wide py-3.5 rounded-xl mt-2 transition-all duration-200 active:scale-[0.98] shadow-[0_4px_20px_rgba(250,204,21,0.3)] hover:shadow-[0_4px_28px_rgba(250,204,21,0.45)] relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 pointer-events-none" />
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Creating account…
                  </span>
                ) : (
                  <>Register <ArrowRight size={15} /></>
                )}
              </button>
            </form>

            {/* bottom links */}
            <div className="flex flex-col items-center gap-3 mt-6">
              <p className="text-white text-xs text-center">
                Already have an account?{" "}
                <Link to="/login" className="text-yellow-400 font-bold hover:text-yellow-300 transition-colors">
                  Login here
                </Link>
              </p>
              <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
              <p className="text-white text-[10px] tracking-wide text-center">
                By registering you agree to CabIndia's{" "}
                <Link to="/terms" className="text-white hover:text-white underline underline-offset-2">Terms</Link>
                {" "}&{" "}
                <Link to="/privacy" className="text-white hover:text-white underline underline-offset-2">Privacy Policy</Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}