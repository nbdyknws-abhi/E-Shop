import React from "react";
import Logo from "../assets/Logo.png";
import { Link } from "react-router-dom";
import SocialLinks from "./SocialLinks";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaHeart } from "react-icons/fa";

const Footer = () => {
  const ScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // for smooth animation
    });
  };

  return (
    <footer className="bg-gradient-to-r from-green-100 via-white to-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-gray-700">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <img src={Logo} alt="Chopper Town Logo" className="h-16 mb-4" />
            <p className="text-sm mb-4">
              Your one-stop destination for quality products at unbeatable
              prices. We bring you the best shopping experience with fast
              delivery and excellent customer service.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <FaEnvelope className="mr-2 text-green-500" />
                support@choppertown.com
              </div>
              <div className="flex items-center">
                <FaPhone className="mr-2 text-green-500" />
                +91 94331 37660
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt className="mr-2 text-green-500" />
                Kolkata, West Bengal
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to={"/"}
                  className="hover:text-green-500 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to={"https://portfolio-three-orpin-wz6ywtduji.vercel.app/"}
                  target="_blank"
                  className="hover:text-green-500 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to={"/contact"}
                  onClick={ScrollToTop}
                  className="hover:text-green-500 transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to={"/contact"}
                  onClick={ScrollToTop}
                  className="hover:text-green-500 transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to={"/"}
                  className="hover:text-green-500 transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to={"/contact"}
                  onClick={ScrollToTop}
                  className="hover:text-green-500 transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to={"/"}
                  className="hover:text-green-500 transition-colors"
                >
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link
                  to={"/"}
                  className="hover:text-green-500 transition-colors"
                >
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link
                  to={"/"}
                  className="hover:text-green-500 transition-colors"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  to={"/"}
                  className="hover:text-green-500 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <p className="text-sm mb-4">
              Stay connected for updates, offers, and more!
            </p>
            <SocialLinks variant="horizontal" size="large" />

            {/* Newsletter Signup */}
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Newsletter</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button className="px-4 py-2 bg-green-500 text-white text-sm rounded-r-lg hover:bg-green-600 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-300">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <div className="flex items-center mb-4 md:mb-0">
              © {new Date().getFullYear()} Chopper Town. All rights reserved.
              <span className="mx-2">|</span>
              Made by
              <a
                href="https://portfolio-three-orpin-wz6ywtduji.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-green-500 hover:text-green-600 font-medium"
              >
                Abhishek Verma 🌚
              </a>
            </div>

            <div className="flex space-x-4">
              <Link to={"/"} className="hover:text-green-500 transition-colors">
                Privacy
              </Link>
              <Link to={"/"} className="hover:text-green-500 transition-colors">
                Terms
              </Link>
              <Link
                to={"/contact"}
                onClick={ScrollToTop}
                className="hover:text-green-500 transition-colors"
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
