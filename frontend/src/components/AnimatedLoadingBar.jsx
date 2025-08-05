// components/LoadingScreen.jsx
import React from "react";
import skull from "../assets/Logo.png"; // replace with your image path

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
      <div className="text-center space-y-4">
        {/* Logo with subtle bounce */}
        <div className="flex justify-center mb-6">
          <img src={skull} alt="Logo" className="w-16 h-16 animate-bounce" />
        </div>

        {/* Progress bar container */}
        <div className="relative w-[280px] h-[6px] bg-slate-700 rounded-full overflow-hidden shadow-lg">
          <div className="absolute h-full bg-gradient-to-r from-green-400 to-green-500 animate-fill-bar rounded-full shadow-md"></div>
        </div>

        {/* Loading text */}
        <p className="text-white text-sm font-medium animate-pulse">
          Loading amazing products...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
