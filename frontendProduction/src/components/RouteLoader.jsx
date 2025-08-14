// src/components/RouteLoader.jsx
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import LoadingScreen from "./AnimatedLoadingBar"; 

const RouteLoader = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const firstLoad = useRef(true); // persists across rerenders

  useEffect(() => {
    if (firstLoad.current && location.pathname === "/") {
      firstLoad.current = false; // first load done, no loading screen
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return loading ? <LoadingScreen /> : null;
};

export default RouteLoader;
