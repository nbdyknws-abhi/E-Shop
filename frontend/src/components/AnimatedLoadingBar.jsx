// components/LoadingScreen.jsx
import React from "react";
import skull from "../assets/Logo.png"; // replace with your image path

const LoadingScreen = () => {
  return (
     <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-800">
      <div className="relative w-[300px] h-[40px] bg-transparent border-2 border-yellow-500 rounded overflow-hidden">
        
        <div className="absolute h-full bg-green-500 animate-fill-bar"></div>

        <img
          src={skull}
          alt="skull"
          className="absolute w-10 h-10 top-1/2 -translate-y-1/2 animate-move-image"
        />
      </div>
    </div>
  );
};

export default LoadingScreen;
