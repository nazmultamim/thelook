'use client';


import { createContext, useContext, useState, useCallback, useRef } from "react";

const ToastContext = createContext(null);

let _id = 0;
const nextId = () => ++_id;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((variant, title, message, duration = 4000) => {
    const id = nextId();
    setToasts((prev) => [...prev, { id, variant, title, message, duration }]);
    return id;
  }, []);

  const toast = {
    success: (title, message, duration) => add("success", title, message, duration),
    error:   (title, message, duration) => add("error",   title, message, duration),
    warning: (title, message, duration) => add("warning", title, message, duration),
    info:    (title, message, duration) => add("info",    title, message, duration),
  };

  return (
    <ToastContext.Provider value={{ toasts, dismiss, toast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
