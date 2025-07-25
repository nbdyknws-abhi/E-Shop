import React from "react";
import Hero from "../components/Hero";
import Products from "../components/Products";
import { useRef } from "react";

const HomePage = () => {
   const productsRef = useRef(null);

  const scrollToProducts = () => {
    if (!productsRef.current) return;

    const elementPosition = productsRef.current.offsetTop;
    const navbarHeight = 64; // Tailwind h-16 = 64px

    window.scrollTo({
      top: elementPosition - navbarHeight,
      behavior: "smooth",
    });
  };

  return (
    <div>    
      <Hero scrollToProducts={scrollToProducts} />
      <div ref={productsRef}>
        <Products />
      </div>
    </div>
  );
};

export default HomePage;