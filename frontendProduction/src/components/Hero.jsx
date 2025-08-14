import React, { useEffect, useState } from "react";
import HeroImage1 from "../assets/HeroImage1.jpg";
import HeroImage2 from "../assets/HeroImage2.jpg";
import HeroImage3 from "../assets/HeroImage3.jpg";
import HeroImage4 from "../assets/HeroImage4.jpg";
import HeroImage5 from "../assets/HeroImage5.jpg";
import { BsArrowRightSquareFill, BsArrowLeftSquareFill } from "react-icons/bs";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    title: "Fast Delivery 🚀",
    description: "Get your favorite products delivered in no time!",
    image: HeroImage1,
  },
  {
    title: "Fresh Groceries 🥦",
    description: "Get farm-fresh items delivered to your doorstep.",
    image: HeroImage2,
  },
  {
    title: "Affordable Prices 💰",
    description: "Quality stuff at prices you’ll love. Save more, shop smart.",
    image: HeroImage3,
  },
  {
    title: "Easy Returns 🔁",
    description: "Didn’t like it? Return easily within 7 days.",
    image: HeroImage4,
  },
  {
    title: "24/7 Support 🛎️",
    description: "We’re here whenever you need us — always a click away.",
    image: HeroImage5,
  },
];

const Hero = ({ scrollToProducts }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setCurrent((prev) => (prev + 1) % slides.length),
    onSwipedRight: () =>
      setCurrent((prev) => (prev - 1 + slides.length) % slides.length),
    trackMouse: true,
  });

  return (
    <section
      className="relative bg-black text-white px-6 py-12 mx-auto max-w-7xl rounded-xl mt-32 overflow-hidden"
      {...swipeHandlers}
    >
      {/* Blurred Background */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-xl opacity-30"
        style={{ backgroundImage: `url(${slides[current].image})` }}
      ></div>
      <div className="min-h-[100px] relative">
        <AnimatePresence mode="wait">
          <motion.div
            layout
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 md:flex items-center justify-between  "
          >
            <div className="md:w-1/2 space-y-4 sm:ml-8 md:ml-12 lg:ml-16">
              <h1 className="text-4xl md:text-5xl font-bold">
                {slides[current].title}
              </h1>
              <p>{slides[current].description}</p>
              <button
                onClick={scrollToProducts}
                className="mt-4 bg-green-500 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg"
              >
                Shop Now
              </button>
            </div>
            <div className="md:w-1/2 mt-8 md:mt-0 sm:mr-8 md:mr-12 lg:mr-16 flex justify-center items-center">
              <img
                src={slides[current].image}
                alt="Hero Slide"
                className="w-full max-w-md object-contain h-[300px] rounded shadow-lg"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <button
        onClick={() =>
          setCurrent((current - 1 + slides.length) % slides.length)
        }
        className="absolute top-1/2 left-4  text-4xl font-bold  hover:text-green-400 z-20"
      >
        <BsArrowLeftSquareFill />
      </button>
      <button
        onClick={() => setCurrent((current + 1) % slides.length)}
        className="absolute top-1/2 right-4  text-4xl font-bold text-white hover:text-green-400 z-20"
      >
        <BsArrowRightSquareFill />
      </button>

      {/* Indicators */}
      <div className="flex justify-center mt-6 space-x-2 relative z-10">
        {slides.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full cursor-pointer transition duration-300 ${
              current === index ? "bg-green-500" : "bg-gray-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
