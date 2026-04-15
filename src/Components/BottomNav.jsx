import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Clock, UserCircle, Phone, X, Car, User } from "lucide-react";

const navItems = [
  { id: "home",     label: "Home",     icon: Home,       path: "/" },
  { id: "services", label: "Services", icon: LayoutGrid, path: "/service" },
  { id: "blogs",    label: "Blogs", icon: Clock,      path: "/blog" },
  { id: "account",  label: "Account",  icon: UserCircle, path: "/account" },
  { id: "contact",  label: "Contact",  icon: Phone,      path: "/contact" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [closing,   setClosing]   = useState(false);

  const active = navItems.find((n) => n.path === location.pathname)?.id ?? "home";

  const closePopup = () => {
    setClosing(true);
    setTimeout(() => { setShowLogin(false); setClosing(false); }, 340);
  };

  const handleNav = (item) => {
    if (item.id === "account") {
      setShowLogin(true);
    } else {
      navigate(item.path);
    }
  };

  useEffect(() => {
    document.body.style.overflow = showLogin ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showLogin]);

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .sheet-enter {
          animation: slideUp 0.38s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
        }
      `}</style>

      {/* ── Bottom Nav — mobile only ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* top glow line */}
        <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />

        <div className="bg-gray-950/95 backdrop-blur-xl flex items-center justify-around px-0 pt-1.5 pb-2">
          {navItems.map((item) => {
            const Icon     = item.icon;
            const isActive = active === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNav(item)}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1"
              >
                {/* icon */}
                <span
                  className={[
                    "flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300",
                    isActive
                      ? "bg-yellow-400 text-white shadow-[0_4px_16px_rgba(250,204,21,0.5)] scale-110"
                      : "text-white",
                  ].join(" ")}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                </span>

                {/* label */}
                <span
                  className={[
                    "text-[9px] font-semibold tracking-wide transition-colors duration-300 leading-none",
                    isActive ? "text-yellow-400" : "text-white",
                  ].join(" ")}
                >
                  {item.label}
                </span>

                {/* active dot */}
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-yellow-400 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Login Sheet ── */}
      {showLogin && (
        <>
          {/* backdrop */}
          <div
            className={[
              "fixed inset-0 z-[60] md:hidden bg-black/70 backdrop-blur-sm transition-opacity duration-300",
              closing ? "opacity-0" : "opacity-100",
            ].join(" ")}
            onClick={closePopup}
          />

          {/* sheet */}
          <div
            className={[
              "fixed bottom-0 left-0 right-0 z-[70] md:hidden",
              "bg-gray-950 rounded-t-3xl",
              "border-t border-x border-yellow-400/20",
              "shadow-[0_-20px_60px_rgba(0,0,0,0.85)]",
              closing
                ? "translate-y-full transition-transform duration-300 ease-in"
                : "sheet-enter",
            ].join(" ")}
            style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
          >
            {/* drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-700" />
            </div>

            {/* top glow */}
            <div className="mx-6 mt-3 h-px bg-gradient-to-r from-transparent via-yellow-400/25 to-transparent" />

            {/* header */}
            <div className="flex items-start justify-between px-6 pt-4 pb-3">
              <div>
                <p className="text-[10px] font-bold text-yellow-400/60 tracking-[0.2em] uppercase mb-1">
                  CabIndia
                </p>
                <h3 className="text-xl font-extrabold text-white leading-snug tracking-tight">
                  Who are you{" "}
                  <span className="text-yellow-400">riding as?</span>
                </h3>
              </div>
              <button
                onClick={closePopup}
                className="mt-0.5 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white hover:text-white hover:bg-gray-700 transition-all active:scale-90"
              >
                <X size={15} />
              </button>
            </div>

            {/* buttons */}
            <div className="px-6 flex flex-col gap-3 pt-1">

              {/* Login */}
              <button
                onClick={() => { closePopup(); navigate("/login"); }}
                className="w-full flex items-center gap-3 bg-yellow-400 text-white rounded-2xl px-4 py-3.5 font-bold text-sm tracking-wide shadow-[0_4px_20px_rgba(250,204,21,0.35)] active:scale-[0.98] transition-all duration-150 relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 pointer-events-none" />
                <span className="w-9 h-9 rounded-xl bg-black/10 flex items-center justify-center flex-shrink-0">
                  <User size={17} />
                </span>
                <span className="flex flex-col text-left">
                  <span className="font-bold">Login</span>
                  <span className="text-[11px] font-normal text-white">
                    Access your passenger account
                  </span>
                </span>
                <span className="ml-auto font-bold text-lg">→</span>
              </button>

              {/* Rider Login */}
              <button
                onClick={() => { closePopup(); navigate("/rider"); }}
                     className="w-full flex items-center gap-3 bg-gray-900 text-white border border-yellow-400/25 rounded-2xl px-4 py-3.5 font-bold text-sm tracking-wide active:scale-[0.98] transition-all duration-150 hover:border-yellow-400/50 hover:bg-gray-800">
                <span className="w-9 h-9 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center flex-shrink-0 text-yellow-400">
                  <Car size={17} />
                </span>
                <span className="flex flex-col text-left">
                  <span className="font-bold">Rider Login</span>
                  <span className="text-[11px] font-normal text-white">
                    Drive &amp; earn with CabIndia
                  </span>
                </span>
                <span className="ml-auto text-white text-lg font-bold">→</span>
              </button>

              {/* Cancel */}
              <button
                onClick={closePopup}
                className="w-full py-3 rounded-2xl text-white text-sm font-semibold tracking-wide hover:text-white transition-colors active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}