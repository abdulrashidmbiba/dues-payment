import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

const ToastContext = createContext(null);

let idCounter = 0; 

function Toast({ toast, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger the slide-in on the next tick after mount.
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200); // let the exit transition finish first
  };

  const isSuccess = toast.type === "success";

  return (
    <div
      className={`flex items-start gap-3 rounded-xl shadow-lg px-4 py-3 border w-full transition-all duration-200 ease-out
        ${isSuccess ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}
        ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
    >
      {isSuccess
        ? <CheckCircle2 size={18} className="text-green-600 shrink-0 mt-0.5" />
        : <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />}
      <p className={`text-sm flex-1 ${isSuccess ? "text-green-800" : "text-red-700"}`}>{toast.message}</p>
      <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = "success") => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  // Convenience shorthands
  const toastSuccess = useCallback((message) => showToast(message, "success"), [showToast]);
  const toastError = useCallback((message) => showToast(message, "error"), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, toastSuccess, toastError }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 sm:px-0 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast toast={t} onClose={() => removeToast(t.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}