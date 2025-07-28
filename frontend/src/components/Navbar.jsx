import Logo from "../assets/Logo.png";
import logo from "../assets/logonew.png";
import { Link } from "react-router-dom";
import {
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaRegUserCircle,
  FaHome,
  FaSearch,
} from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { MdContactSupport } from "react-icons/md";
import { useState } from "react";
import SearchData from "./SearchData";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";


export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

console.log(showSearch);
  let token = localStorage.getItem("token");
  const ScrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth', // for smooth animation
  });
};
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully!");
    navigate("/");
  };

  // Scroll to top when the component mounts
  return (
    <nav className="bg-gradient-to-r from-green-100 via-white to-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link  onClick={ScrollToTop}>
              <img src={logo} alt="Logo" className="h-20 w-auto mb-0 mt-2" />
            </Link>
          </div>

          {/* Search */}

          <div className="flex flex-1 justify-center">
            <div className="relative w-full max-w-3xl">
              
              <input
                type="search"
                name=""
                id=""
                placeholder="Search for Products, Brands and More"
                readOnly
                onFocus={() => setShowSearch(true)}
                className="w-full bg-gray-200 rounded-full ps-4 pe-10 py-3 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <FaSearch className="absolute right-3 top-3 text-xl text-gray-500 " />
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link to={"/"}onClick={ScrollToTop}
             className="text-gray-700 hover:text-green-600 ">
              <FaHome className="text-3xl" />
            </Link>
            <Link to={"/cart"} className="text-gray-700 hover:text-green-600 ">
              <FaShoppingCart className="text-3xl" />
            </Link>
             <Link
              to={"/contact"}
              className="flex items-center gap-1 text-gray-700 hover:text-green-600"
            >
              <MdContactSupport className="text-3xl" />
            </Link>
            {
              !token?(<Link
              to={"/login"}
              className="flex items-center gap-1 text-gray-700 hover:text-green-600"
            >
              <FaRegUserCircle className="text-3xl" />
            </Link>):(
              <FiLogOut onClick={handleLogout}
                className="text-3xl text-red-500 hover:text-red-800 cursor-pointer"
              />
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu} className="text-2xl text-green-600">
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white px-4 pt-2 pb-4 space-y-2 shadow-md">
          <Link to={"/"} className="block text-gray-700 hover:text-green-600 cursor-pointer">
            Home
          </Link>
          <Link
            to={"/cart"}
            className="block text-gray-700 hover:text-green-600 cursor-pointer"
          >
            Cart
          </Link>
          {
            !token ? (
              <Link
                to={"/login"}
                className="block text-gray-700 hover:text-green-600 cursor-pointer"
              >
                Login
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="block text-red-500 hover:text-red-800 cursor-pointer"
              >
                Logout
              </button>
            )}
          
        
        </div>
      )}
      {/* Search Data Component */}
      {showSearch && <SearchData onClose={setShowSearch} />}
    </nav>
  );
}