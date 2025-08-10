import React, { useState } from "react";
import { FaSearchPlus, FaTimes } from "react-icons/fa";

const ImageZoom = ({ src, alt, className = "" }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  const openZoom = () => setIsZoomed(true);
  const closeZoom = () => setIsZoomed(false);

  return (
    <>
      {/* Main Image */}
      <div className={`relative group cursor-pointer ${className}`}>
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          onClick={openZoom}
        />
        {/* Zoom Icon Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <FaSearchPlus className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Close Button */}
            <button
              onClick={closeZoom}
              className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition-colors z-10"
            >
              <FaTimes />
            </button>

            {/* Zoomed Image */}
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Click outside to close */}
          <div className="absolute inset-0 -z-10" onClick={closeZoom}></div>
        </div>
      )}
    </>
  );
};

export default ImageZoom;
