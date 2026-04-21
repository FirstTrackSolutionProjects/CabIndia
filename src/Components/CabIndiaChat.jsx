import { useEffect, useRef, useState } from "react";
import { X, MessageCircle, Send, Star, Phone, Copy, Check } from "lucide-react";

const BOT_DELAY = 600;
const TYPING_DELAY = 900;

const OPTIONS = {
  "Booking Issue": {
    icon: "🚕",
    options: [
      "Can't book a ride",
      "Wrong pickup/drop location",
      "Ride not confirmed",
      "Booking app is crashing",
    ],
    replies: {
      "Can't book a ride": "We're sorry you're unable to book. Please check your internet connection and try again. If the issue persists, our team will help you immediately.",
      "Wrong pickup/drop location": "You can edit the pickup or drop location before the captain arrives. Tap the ride card and select 'Edit Location'. Need more help?",
      "Ride not confirmed": "Sometimes confirmations are delayed. Please wait 60 seconds and refresh. If still not confirmed, we'll book a new ride for you.",
      "Booking app is crashing": "Please try clearing the app cache or reinstalling. Our tech team has been notified of this issue.",
    },
  },
  "Driver / Captain Issue": {
    icon: "🧑‍✈️",
    options: [
      "Captain didn't arrive",
      "Captain cancelled the ride",
      "Captain asked for extra fare",
      "Captain behaviour complaint",
    ],
    replies: {
      "Captain didn't arrive": "We understand this is frustrating. We're locating your captain right now. If unreachable, we'll assign a new captain immediately.",
      "Captain cancelled the ride": "We apologize for the inconvenience. We're rebooking your ride with a new captain at the same fare.",
      "Captain asked for extra fare": "This is a policy violation. Please do not pay extra. We're flagging this captain for review and will ensure you're charged correctly.",
      "Captain behaviour complaint": "We take behaviour complaints very seriously. Please describe the incident and we'll take strict action within 24 hours.",
    },
  },
  "Payment Issue": {
    icon: "💳",
    options: [
      "Charged twice for one ride",
      "Refund not received",
      "Payment failed but deducted",
      "Incorrect fare charged",
    ],
    replies: {
      "Charged twice for one ride": "We've identified the duplicate charge. A full refund will be initiated to your original payment method within 3–5 business days.",
      "Refund not received": "Refunds typically take 5–7 business days. We're checking the status of your refund right now.",
      "Payment failed but deducted": "If your payment was deducted but the ride wasn't confirmed, the amount will be auto-refunded within 48 hours.",
      "Incorrect fare charged": "We're reviewing your ride fare. If there's any discrepancy, a refund for the difference will be processed within 3 days.",
    },
  },
  "Safety Concern": {
    icon: "🛡️",
    options: [
      "I felt unsafe during a ride",
      "Captain was intoxicated",
      "SOS not working",
      "Share my ride isn't working",
    ],
    replies: {
      "I felt unsafe during a ride": "Your safety is our top priority. We're immediately escalating this to our safety team. Please stay in a safe location. Do you need us to contact emergency services?",
      "Captain was intoxicated": "This is a zero-tolerance issue. The captain has been suspended pending investigation. We're deeply sorry for this experience.",
      "SOS not working": "We're escalating this to our tech team immediately. In the meantime, please call emergency services directly if needed. We'll fix the SOS issue urgently.",
      "Share my ride isn't working": "We're checking the live tracking feature. As a workaround, you can share your ride details manually from the booking screen.",
    },
  },
  "Cancellation Issue": {
    icon: "❌",
    options: [
      "Cancellation charge dispute",
      "Ride auto-cancelled",
      "Wrong cancellation reason",
      "Refund for cancelled ride",
    ],
    replies: {
      "Cancellation charge dispute": "If your ride was cancelled due to a captain's fault, the cancellation fee will be waived. We're reviewing your case.",
      "Ride auto-cancelled": "We apologize for the auto-cancellation. This usually happens due to network issues. We're rebooking at no extra charge.",
      "Wrong cancellation reason": "We've noted the incorrect cancellation reason. This will be corrected and any wrongful charges will be reversed.",
      "Refund for cancelled ride": "Your refund for the cancelled ride is being processed. It will reflect in your account within 3–5 business days.",
    },
  },
  "App / Technical Issue": {
    icon: "📱",
    options: [
      "App not loading",
      "Map/GPS not working",
      "OTP not received",
      "Notifications not working",
    ],
    replies: {
      "App not loading": "Please try force-closing and reopening the app. If the issue persists, reinstall from the store. Our tech team is aware of ongoing issues.",
      "Map/GPS not working": "Please enable location permissions for CabIndia in your device settings and ensure GPS is turned on.",
      "OTP not received": "OTPs can take up to 60 seconds. Check your SMS inbox or spam folder. We can resend the OTP if needed.",
      "Notifications not working": "Please enable notifications for CabIndia in your device settings. Restart the app after enabling.",
    },
  },
};

const MAIN_CATEGORIES = [
  ...Object.keys(OPTIONS).map((k) => ({ label: k, icon: OPTIONS[k].icon })),
  { label: "Other", icon: "💬" },
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center text-gray-950 text-xs font-black flex-shrink-0">C</div>
      <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
        {[0,1,2].map(i => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-yellow-400"
            style={{ animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />
        ))}
      </div>
    </div>
  );
}

function StarRating({ onRate }) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  return (
    <div className="flex flex-col gap-2 mt-1">
      <p className="text-gray-400 text-xs">Rate your support experience:</p>
      <div className="flex gap-1">
        {[1,2,3,4,5].map(s => (
          <button key={s}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => { setSelected(s); onRate(s); }}
            className="transition-transform hover:scale-125">
            <Star size={24}
              className={s <= (hovered || selected) ? "text-yellow-400 fill-yellow-400" : "text-gray-600"} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CabIndiaChat() {
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);

  const [open, setOpen]                 = useState(false);
  const [messages, setMessages]         = useState([]);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [step, setStep]                 = useState("WELCOME");
  const [currentCategory, setCurrentCategory] = useState("");
  const [showInput, setShowInput]       = useState(false);
  const [inputText, setInputText]       = useState("");
  const [isTyping, setIsTyping]         = useState(false);
  const [showRating, setShowRating]     = useState(false);
  const [rated, setRated]               = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [bookingId, setBookingId]       = useState("");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [copied, setCopied]             = useState(false);
  const [unread, setUnread]             = useState(0);

  const TICKET_REF = "TKT-" + Math.random().toString(36).slice(2,8).toUpperCase();

  const scrollToBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  const addBot = (text, extra = {}) => {
    setIsTyping(false);
    setMessages(prev => [...prev, { from: "bot", text, ...extra }]);
    if (!open) setUnread(u => u + 1);
  };

  const addUser = (text) =>
    setMessages(prev => [...prev, { from: "user", text }]);

  const botSay = (text, delay = BOT_DELAY, extra = {}) => {
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => addBot(text, extra), TYPING_DELAY);
    }, delay);
  };

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, currentOptions]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      if (messages.length === 0) initChat();
    }
  }, [open]);

  const initChat = () => {
    botSay("👋 Hello! Welcome to CabIndia Support.", 300);
    setTimeout(() => {
      botSay("I'm here to help you with any ride-related issues. What can I help you with today?", 300 + TYPING_DELAY + 400);
      setTimeout(() => {
        setCurrentOptions(MAIN_CATEGORIES);
        setStep("MAIN");
      }, 300 + TYPING_DELAY * 2 + 600);
    }, 0);
  };

  const handleOption = (option) => {
    const label = typeof option === "string" ? option : option.label;
    addUser(label);
    setCurrentOptions([]);
    setShowInput(false);

    if (step === "MAIN") {
      if (label === "Other") {
        botSay("Please describe your issue below and we'll get back to you:");
        setTimeout(() => setShowInput(true), BOT_DELAY + TYPING_DELAY + 200);
      } else {
        setCurrentCategory(label);
        botSay(`Got it — "${label}". Please choose a specific issue:`);
        setTimeout(() => {
          setCurrentOptions(OPTIONS[label].options.map(o => o));
          setStep("SUB");
        }, BOT_DELAY + TYPING_DELAY + 200);
      }
    } else if (step === "SUB") {
      botSay(OPTIONS[currentCategory].replies[label]);
      setTimeout(() => askSolved(), BOT_DELAY + TYPING_DELAY + 400);
    } else if (step === "SOLVED") {
      handleSolved(label);
    } else if (step === "AGENT") {
      handleAgent(label);
    }
  };

  const askSolved = () => {
    botSay("Was this helpful? Is your issue resolved?", 0);
    setTimeout(() => {
      setCurrentOptions(["✅ Yes, resolved", "❌ No, still have issue", "🎧 Talk to live agent"]);
      setStep("SOLVED");
    }, TYPING_DELAY + 200);
  };

  const handleSolved = (answer) => {
    if (answer === "✅ Yes, resolved") {
      botSay("That's great! 🎉 Thank you for using CabIndia.", 0, { showRating: true });
      setTimeout(() => setShowRating(true), TYPING_DELAY + 200);
      setStep("DONE");
    } else if (answer === "🎧 Talk to live agent") {
      botSay("Connecting you to a live agent. Please hold on...", 0);
      setTimeout(() => {
        botSay("Our support agent is available at:", 0, { showAgent: true });
        setStep("AGENT");
      }, TYPING_DELAY + 500);
    } else {
      botSay("I'm sorry to hear that. Let me raise a support ticket for you.", 0);
      setTimeout(() => {
        setShowTicketForm(true);
        setStep("TICKET");
      }, TYPING_DELAY + 300);
    }
  };

  const handleAgent = () => {};

  const submitTicket = () => {
    if (!bookingId.trim()) return;
    addUser(`Booking ID: ${bookingId}`);
    setShowTicketForm(false);
    setBookingId("");
    botSay(`✅ Ticket raised successfully! Your ticket ID is **${TICKET_REF}**. Our team will contact you within 2 hours.`, 0, { ticketRef: TICKET_REF });
    setTicketSubmitted(true);
    setTimeout(() => setShowRating(true), TYPING_DELAY + 500);
    setStep("DONE");
  };

  const submitFreeText = () => {
    if (!inputText.trim()) return;
    addUser(inputText);
    setShowInput(false);
    setInputText("");
    botSay("Thank you for describing your issue. Let me raise a ticket for you.", 0);
    setTimeout(() => {
      setShowTicketForm(true);
      setStep("TICKET");
    }, TYPING_DELAY + 300);
  };

  const copyTicket = () => {
    navigator.clipboard.writeText(TICKET_REF).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const restartChat = () => {
    setMessages([]);
    setCurrentOptions([]);
    setStep("WELCOME");
    setCurrentCategory("");
    setShowInput(false);
    setInputText("");
    setIsTyping(false);
    setShowRating(false);
    setRated(false);
    setShowTicketForm(false);
    setBookingId("");
    setTicketSubmitted(false);
    setTimeout(() => initChat(), 100);
  };

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%,60%,100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(16px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .chat-window { animation: fadeSlideUp 0.3s cubic-bezier(0.34,1.2,0.64,1) forwards; }
        .pulse-ring  { animation: pulse-ring 1.5s ease-out infinite; }
      `}</style>

      {/* ── Floating Button ── */}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-[100] flex flex-col items-end gap-3">
        {!open && (
          <div className="relative">
            <div className="pulse-ring absolute inset-0 rounded-full bg-yellow-400 pointer-events-none" />
            <button
              onClick={() => setOpen(true)}
              className="relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-yellow-400 hover:bg-yellow-300 text-gray-950 flex items-center justify-center shadow-[0_8px_32px_rgba(250,204,21,0.5)] transition-all active:scale-95"
            >
              {/* robot face SVG */}
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="5" y="10" width="18" height="13" rx="4" fill="#1f2937"/>
                <circle cx="10" cy="16" r="2" fill="#facc15"/>
                <circle cx="18" cy="16" r="2" fill="#facc15"/>
                <rect x="11" y="20" width="6" height="1.5" rx="0.75" fill="#facc15"/>
                <line x1="14" y1="10" x2="14" y2="7" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="14" cy="6" r="1.5" fill="#1f2937"/>
                <rect x="3" y="13" width="2" height="5" rx="1" fill="#1f2937"/>
                <rect x="23" y="13" width="2" height="5" rx="1" fill="#1f2937"/>
              </svg>
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>
          </div>
        )}

        {/* ── Chat Window ── */}
        {open && (
          <div className="chat-window flex flex-col bg-gray-950 border border-yellow-400/25 rounded-2xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.7)]"
            style={{
              width: "min(360px, calc(100vw - 20px))",
              height: "min(520px, calc(100dvh - 190px))",
            }}
          >

            {/* header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center text-gray-950">
                  <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                    <rect x="5" y="10" width="18" height="13" rx="4" fill="#1f2937"/>
                    <circle cx="10" cy="16" r="2" fill="#facc15"/>
                    <circle cx="18" cy="16" r="2" fill="#facc15"/>
                    <rect x="11" y="20" width="6" height="1.5" rx="0.75" fill="#facc15"/>
                    <line x1="14" y1="10" x2="14" y2="7" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="14" cy="6" r="1.5" fill="#1f2937"/>
                    <rect x="3" y="13" width="2" height="5" rx="1" fill="#1f2937"/>
                    <rect x="23" y="13" width="2" height="5" rx="1" fill="#1f2937"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-bold leading-none">CabIndia Support</p>
                  <p className="text-green-400 text-[10px] flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                    Online · Replies instantly
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={restartChat}
                  className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-all text-xs font-bold"
                  title="Restart chat">↺</button>
                <button onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* messages */}
            <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-3"
              style={{ scrollbarWidth: "none" }}>

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "items-end gap-2"}`}>
                  {msg.from === "bot" && (
                    <div className="w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center text-gray-950 text-xs font-black flex-shrink-0">C</div>
                  )}
                  <div className={[
                    "px-3 py-2.5 rounded-2xl text-sm max-w-[80%] leading-relaxed",
                    msg.from === "user"
                      ? "bg-yellow-400 text-gray-950 font-semibold rounded-br-sm"
                      : "bg-gray-800 border border-gray-700 text-gray-200 rounded-bl-sm",
                  ].join(" ")}>
                    {msg.text}

                    {/* ticket ref copy */}
                    {msg.ticketRef && (
                      <div className="mt-2 flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2">
                        <span className="text-yellow-400 text-xs font-black">{msg.ticketRef}</span>
                        <button onClick={copyTicket} className="ml-auto text-gray-500 hover:text-yellow-400 transition-colors">
                          {copied ? <Check size={13} /> : <Copy size={13} />}
                        </button>
                      </div>
                    )}

                    {/* live agent info */}
                    {msg.showAgent && (
                      <div className="mt-2 flex flex-col gap-2">
                        <a href="tel:+911234567890"
                          className="flex items-center gap-2 bg-yellow-400 text-gray-950 px-3 py-2 rounded-xl text-xs font-bold hover:bg-yellow-300 transition-all">
                          <Phone size={13} /> Call: +91 12345 67890
                        </a>
                        <a href="https://wa.me/911234567890"
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-green-500/20 border border-green-500/30 text-green-400 px-3 py-2 rounded-xl text-xs font-bold hover:bg-green-500/30 transition-all">
                          💬 WhatsApp Support
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* typing indicator */}
              {isTyping && <TypingIndicator />}

              {/* option buttons */}
              {!isTyping && currentOptions.length > 0 && (
                <div className="flex flex-col gap-2 ml-9">
                  {currentOptions.map((opt, i) => {
                    const label = typeof opt === "string" ? opt : opt.label;
                    const icon  = typeof opt === "object" ? opt.icon : null;
                    return (
                      <button key={i} onClick={() => handleOption(opt)}
                        className="flex items-center gap-2.5 w-full text-left bg-gray-900 border border-gray-700 hover:border-yellow-400/60 hover:bg-gray-800 text-gray-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all duration-200 active:scale-[0.98]">
                        {icon && <span className="text-sm">{icon}</span>}
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* free text input */}
              {showInput && (
                <div className="ml-9 flex gap-2">
                  <input
                    ref={inputRef}
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && submitFreeText()}
                    placeholder="Describe your issue..."
                    className="flex-1 bg-gray-800 border border-gray-700 focus:border-yellow-400/60 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-all"
                  />
                  <button onClick={submitFreeText}
                    className="w-10 h-10 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-gray-950 flex items-center justify-center transition-all active:scale-95 flex-shrink-0">
                    <Send size={15} />
                  </button>
                </div>
              )}

              {/* ticket form */}
              {showTicketForm && (
                <div className="ml-9 bg-gray-900 border border-yellow-400/20 rounded-2xl p-3 flex flex-col gap-2">
                  <p className="text-yellow-400 text-[10px] font-bold tracking-widest uppercase">Raise a Ticket</p>
                  <input
                    value={bookingId}
                    onChange={e => setBookingId(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && submitTicket()}
                    placeholder="Enter Booking ID (e.g. CB-12345)"
                    className="bg-gray-800 border border-gray-700 focus:border-yellow-400/60 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-all"
                  />
                  <button onClick={submitTicket}
                    className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-bold text-sm py-2.5 rounded-xl transition-all active:scale-[0.98]">
                    Submit Ticket
                  </button>
                </div>
              )}

              {/* star rating */}
              {showRating && !rated && (
                <div className="ml-9 bg-gray-900 border border-gray-700 rounded-2xl p-3">
                  <StarRating onRate={(r) => {
                    setRated(true);
                    setShowRating(false);
                    addUser(`Rated: ${"⭐".repeat(r)}`);
                    botSay(r >= 4
                      ? "🌟 Thank you for the great rating! Glad we could help. Safe riding!"
                      : "Thank you for your feedback. We'll keep improving. Safe riding! 🚕");
                  }} />
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* bottom bar */}
            <div className="px-4 py-2 border-t border-gray-800 flex items-center justify-center">
              <p className="text-gray-700 text-[10px] tracking-wide">
                Powered by <span className="text-yellow-400 font-bold">CabIndia</span> Support AI
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}