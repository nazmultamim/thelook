import { useEffect, useRef, useState } from "react";
import { X, CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";
import { useToast } from "../../context/";

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    accent: "#22c55e",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    iconColor: "#16a34a",
    title: "text-[#14532d]",
    msg: "text-[#166534]",
    bar: "#22c55e",
  },
  error: {
    icon: XCircle,
    accent: "#ef4444",
    bg: "#fef2f2",
    border: "#fecaca",
    iconColor: "#dc2626",
    title: "text-[#7f1d1d]",
    msg: "text-[#991b1b]",
    bar: "#ef4444",
  },
  warning: {
    icon: AlertTriangle,
    accent: "#f59e0b",
    bg: "#fffbeb",
    border: "#fde68a",
    iconColor: "#d97706",
    title: "text-[#78350f]",
    msg: "text-[#92400e]",
    bar: "#f59e0b",
  },
  info: {
    icon: Info,
    accent: "#d97845",
    bg: "#fdf5ee",
    border: "#f0d9c8",
    iconColor: "#b8622f",
    title: "text-[#2c1a0e]",
    msg: "text-[#6b3a1f]",
    bar: "#d97845",
  },
};

function Toast({ id, variant, title, message, duration, onDismiss }) {
  const v = VARIANTS[variant] ?? VARIANTS.info;
  const Icon = v.icon;
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef(null);
  const startRef = useRef(null);

  /* slide-in on mount */
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  /* countdown bar */
  useEffect(() => {
    startRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining === 0) {
        clearInterval(intervalRef.current);
        handleClose();
      }
    }, 30);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onDismiss(id), 300);
  };

  return (
    <div
      style={{
        borderColor: v.border,
        backgroundColor: v.bg,
        transform: visible ? "translateX(0)" : "translateX(110%)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.35s cubic-bezier(0.34,1.2,0.64,1), opacity 0.3s ease",
        boxShadow: "0 6px 24px rgba(60,30,10,0.12), 0 1px 4px rgba(60,30,10,0.08)",
      }}
      className="relative w-[340px] max-w-[calc(100vw-32px)] rounded-2xl border overflow-hidden"
    >
      {/* Left accent stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ backgroundColor: v.accent }}
      />

      {/* Body */}
      <div className="flex items-start gap-3 px-4 pl-5 pt-3.5 pb-3.5">
        <Icon size={20} className="shrink-0 mt-0.5" style={{ color: v.iconColor }} />
        <div className="flex-1 min-w-0">
          <p className={`text-[13.5px] font-bold m-0 leading-snug ${v.title}`}>{title}</p>
          {message && (
            <p className={`text-[12.5px] m-0 mt-0.5 leading-snug ${v.msg}`}>{message}</p>
          )}
        </div>
        <button
          onClick={handleClose}
          className="bg-transparent border-none cursor-pointer p-0.5 rounded-lg hover:bg-black/5 transition-colors shrink-0 mt-0.5"
        >
          <X size={15} className="text-[#9b8070]" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-[3px] w-full bg-black/5">
        <div
          className="h-full rounded-full transition-none"
          style={{ width: `${progress}%`, backgroundColor: v.bar }}
        />
      </div>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <Toast {...t} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  );
}
