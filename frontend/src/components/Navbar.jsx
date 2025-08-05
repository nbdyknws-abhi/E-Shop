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
  FaUser,
  FaCog,
} from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { MdContactSupport, MdDashboard, MdSupport } from "react-icons/md";
import { useState } from "react";
import SearchData from "./SearchData";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../features/cartSlice/cartSlice";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get cart data from Redux store
  const cartItems = useSelector((state) => state.Cart.cartItems);
  const cartQuantity = useSelector((state) => state.Cart.TotalQuantity);

  console.log(showSearch);
  let token = localStorage.getItem("token");
  let userType = localStorage.getItem("userType");

  // Check if current user is admin
  const isAdmin = userType === "admin";
  const ScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // for smooth animation
    });
  };
  const handleLogout = () => {
    const userId = localStorage.getItem("user");

    // Save current cart to backend before logout (important for cart persistence)
    if (userId && cartItems.length > 0) {
      const cartData = {
        userId: userId,
        cartItems: cartItems,
        totalPrice:
          cartQuantity > 0
            ? cartItems.reduce(
                (total, item) => total + item.ProductPrice * item.quantity,
                0
              )
            : 0,
        totalQuantity: cartQuantity,
      };

      // Save to backend asynchronously (don't wait for response)
      fetch("/api/cart/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(cartData),
      }).catch((err) => console.log("Cart save on logout failed:", err));
    }

    // Clear the Redux cart state to prevent cart mixing between users
    dispatch(clearCart(userId));

    // Clear authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userName");
    localStorage.removeItem("userType");

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
            <Link onClick={ScrollToTop}>
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
            <Link
              to={"/"}
              onClick={ScrollToTop}
              className="text-gray-700 hover:text-green-600 "
            >
              <FaHome className="text-3xl" />
            </Link>
            <Link
              to={"/cart"}
              className="text-gray-700 hover:text-green-600 relative"
            >
              <FaShoppingCart className="text-3xl" />
              {cartQuantity > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartQuantity}
                </span>
              )}
            </Link>
            <Link
              to={"/contact"}
              className="flex items-center gap-1 text-gray-700 hover:text-green-600"
            >
              <MdContactSupport className="text-3xl" />
            </Link>
            {/* Admin Dashboard Button - Only visible for admins */}
            {isAdmin && (
              <Link
                to={"/admin/"}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-all duration-200"
                title="Admin Dashboard"
              >
                <MdDashboard className="text-2xl" />
                <span className="text-sm font-medium hidden lg:block">
                  Admin
                </span>
              </Link>
            )}
            {token && (
              <Link
                to={"/my-profile"}
                className="flex items-center gap-1 text-gray-700 hover:text-green-600"
                title="My Profile"
              >
                <FaUser className="text-3xl" />
              </Link>
            )}
            {!token ? (
              <Link
                to={"/login"}
                className="flex items-center gap-1 text-gray-700 hover:text-green-600"
              >
                <FaUser className="text-3xl" />
              </Link>
            ) : (
              <FiLogOut
                onClick={handleLogout}
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
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-2 space-y-2">
          <Link
            to={"/"}
            onClick={ScrollToTop}
            className="block text-gray-700 hover:text-green-600 cursor-pointer"
          >
            Home
          </Link>
          <Link
            to={"/cart"}
            className="block text-gray-700 hover:text-green-600 cursor-pointer relative"
          >
            Cart {cartQuantity > 0 && `(${cartQuantity})`}
          </Link>
          <Link
            to={"/contact"}
            className="block text-gray-700 hover:text-green-600 cursor-pointer"
          >
            Contact
          </Link>
          {/* Admin Dashboard Link - Mobile */}
          {isAdmin && (
            <Link
              to={"/admin/"}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer"
            >
              
              <span className="font-medium">Admin Dashboard</span>
            </Link>
          )}
          {token && (
            <Link
              to={"/my-profile"}
              className="block text-gray-700 hover:text-green-600 cursor-pointer"
            >
              My Profile
            </Link>
          )}
          {!token ? (
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
