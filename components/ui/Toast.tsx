"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, Component, ErrorInfo } from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

class ToastErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ToastProvider caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <>{this.props.children}</>;
    }
    return this.props.children;
  }
}

function ToastProviderContent({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType) => {
    if (!message) return;
    try {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...(prev || []), { id, message, type }]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const currentToasts = toasts || [];
    const timers = currentToasts.map((toast) => {
      if (!toast) return null;
      return setTimeout(() => {
        setToasts((prev) => (prev || []).filter((t) => t?.id !== toast?.id));
      }, 4000);
    });
    return () => {
      (timers || []).forEach((t) => {
        if (t) clearTimeout(t);
      });
    };
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-20 md:bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {(toasts || []).map((toast) => {
          if (!toast) return null;
          return (
            <div
              key={toast.id}
              className={`px-4 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 pointer-events-auto ${
                toast.type === "success" ? "bg-green-600" :
                toast.type === "error" ? "bg-red-600" :
                toast.type === "warning" ? "bg-amber-500" :
                "bg-blue-600"
              }`}
              style={{ animation: 'slideIn 0.3s ease-out forwards' }}
            >
              {toast.message}
            </div>
          );
        })}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}} />
    </ToastContext.Provider>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <ToastErrorBoundary>
      <ToastProviderContent>{children}</ToastProviderContent>
    </ToastErrorBoundary>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    console.error("useToast must be used within a ToastProvider. Returning mock implementation to prevent crash.");
    return {
      showToast: (message: string, type: ToastType) => {
        console.warn(`[Toast Fallback] ${type}: ${message}`);
      }
    };
  }
  return context;
}
