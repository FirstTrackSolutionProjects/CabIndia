// src/Pages/Admin/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Shield, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/api/auth/login", {
        email: form.email,
        password: form.password,
      });
      if (response.data.success && response.data.user.role === 'admin') {
        await login(response.data.user, response.data.token);
        navigate("/admin/dashboard");
      } else {
        setError("Unauthorized access. Admin privileges required.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .card-anim { animation: fadeUp 0.5s cubic-bezier(0.34,1.1,0.64,1) forwards; }
      `}</style>

      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(250,204,21,0.8) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(250,204,21,0.8) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="card-anim relative w-full max-w-md z-10">
          <div className="h-1 w-full rounded-t-3xl bg-yellow-400"
            style={{ boxShadow: "0 0 24px 4px rgba(250,204,21,0.4)" }} />

          <div className="bg-gray-900 border border-gray-800 border-t-0 rounded-b-3xl px-8 py-10 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400/6 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col items-center gap-3 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/25 flex items-center justify-center text-yellow-400">
                <Shield size={28} strokeWidth={1.8} />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold tracking-[0.25em] text-yellow-400/60 uppercase mb-1">CabIndia</p>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Admin <span className="text-yellow-400 italic">Login</span>
                </h1>
                <p className="text-white text-xs mt-1.5">Access the CabIndia control panel</p>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-7" />

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-[0.15em] text-white uppercase">
                  Email <span className="text-yellow-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@cabindia.com"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 focus:border-yellow-400/60 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(250,204,21,0.08)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold tracking-[0.15em] text-white uppercase">
                    Password <span className="text-yellow-400">*</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 focus:border-yellow-400/60 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-gray-600 outline-none transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(250,204,21,0.08)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-white transition-colors"
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-xs mt-1">{error}</p>
              )}

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
                    Signing in…
                  </span>
                ) : (
                  <>Login <ArrowRight size={15} /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}