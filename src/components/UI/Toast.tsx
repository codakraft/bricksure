import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(7);
    const newToast = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration || 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success:
      "text-green-600 bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800",
    error:
      "text-red-600 bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-800",
    warning:
      "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/50 border-yellow-200 dark:border-yellow-800",
    info: "text-blue-600 bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800",
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-3">
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <div
              key={toast.id}
              className={`min-w-80 max-w-md w-full shadow-xl rounded-xl pointer-events-auto border-2 ${
                colors[toast.type]
              } animate-in slide-in-from-right-full duration-300`}
            >
              <div className="p-6">
                <div className="flex items-center justify-center">
                  <div className="flex-shrink-0">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="ml-4 flex-1 text-center">
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      {toast.title}
                    </p>
                    {toast.message && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {toast.message}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 flex-shrink-0 flex">
                    <button
                      className="rounded-full p-1 inline-flex text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors"
                      onClick={() => removeToast(toast.id)}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
