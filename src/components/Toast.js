import React from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

export function Toast({ message, type = "info", duration = 3000, onClose }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: "bg-green-500/20 border-green-500/30",
    error: "bg-red-500/20 border-red-500/30",
    info: "bg-blue-500/20 border-blue-500/30",
  }[type];

  const textColor = {
    success: "text-green-400",
    error: "text-red-400",
    info: "text-blue-400",
  }[type];

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: AlertCircle,
  }[type];

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg border ${bgColor} flex items-center gap-3 ${textColor}`}
    >
      <Icon size={20} />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
