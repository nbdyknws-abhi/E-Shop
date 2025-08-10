import React from "react";
import { FaExclamationTriangle, FaTimes } from "react-icons/fa";

const ErrorMessage = ({ message, onClose, type = "error" }) => {
  const typeStyles = {
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  const iconColors = {
    error: "text-red-500",
    warning: "text-yellow-500",
    info: "text-blue-500",
  };

  if (!message) return null;

  return (
    <div
      className={`border rounded-lg p-4 mb-4 ${typeStyles[type]} flex items-center justify-between`}
    >
      <div className="flex items-center">
        <FaExclamationTriangle className={`mr-2 ${iconColors[type]}`} />
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-600"
        >
          <FaTimes />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
