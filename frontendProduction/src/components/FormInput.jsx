import React from "react";
import { FaCheck, FaTimes } from "react-icons/fa";

const FormInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  className = "",
  ...props
}) => {
  const hasError = error && error.trim() !== "";
  const isValid = required && value && value.trim() !== "" && !hasError;

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-gray-700 font-medium mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            hasError
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : isValid
              ? "border-green-300 focus:ring-green-500 focus:border-green-500"
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          }`}
          {...props}
        />

        {/* Validation Icons */}
        {(hasError || isValid) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {hasError ? (
              <FaTimes className="text-red-500" />
            ) : (
              <FaCheck className="text-green-500" />
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {hasError && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <FaTimes className="mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

// Validation helper functions
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return "";
};

export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  return "";
};

export const validateRequired = (value, fieldName = "Field") => {
  if (!value || value.trim() === "") return `${fieldName} is required`;
  return "";
};

export const validatePrice = (price) => {
  if (!price) return "Price is required";
  if (isNaN(price) || parseFloat(price) <= 0)
    return "Please enter a valid price";
  return "";
};

export default FormInput;
