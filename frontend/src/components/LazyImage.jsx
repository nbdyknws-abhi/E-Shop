import React, { useState, useRef, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";

const LazyImage = ({
  src,
  alt,
  className = "",
  placeholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij5Mb2FkaW5nLi4uPC90ZXh0Pjwvc3ZnPg==",
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {!isInView ? (
        <div className="w-full h-full bg-gray-200 animate-pulse rounded flex items-center justify-center">
          <LoadingSpinner size="small" message="" />
        </div>
      ) : (
        <>
          {!isLoaded && !hasError && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse rounded flex items-center justify-center">
              <LoadingSpinner size="small" message="" />
            </div>
          )}

          {hasError ? (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500 rounded">
              <span className="text-sm">Failed to load image</span>
            </div>
          ) : (
            <img
              src={isInView ? src : placeholder}
              alt={alt}
              className={`transition-opacity duration-300 ${
                isLoaded ? "opacity-100" : "opacity-0"
              } ${className}`}
              onLoad={handleLoad}
              onError={handleError}
              {...props}
            />
          )}
        </>
      )}
    </div>
  );
};

export default LazyImage;
