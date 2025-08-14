import React from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Slidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all stored authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userName");
    localStorage.removeItem("userType");

    toast.success("Admin logged out successfully");
    navigate("/");
  };

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-8">Admin Panel </h2>
      <nav className="space-y-4">
        <Link
          to={"/admin/"}
          className="block hover:text-green-400 transition-colors"
        >
          📊 Dashboard
        </Link>
        <Link
          to={"/admin/products"}
          className="block hover:text-green-400 transition-colors"
        >
          📦 Manage Products
        </Link>
        <Link
          to={"/admin/admin-query"}
          className="block hover:text-green-400 transition-colors"
        >
          💬 Manage Queries
        </Link>
        <Link
          to={"/admin/orders"}
          className="block hover:text-green-400 transition-colors"
        >
          🧾 Manage Orders
        </Link>

        <hr className="border-gray-600 my-4" />

        <Link
          to={"/"}
          className="block text-blue-400 hover:text-blue-300 transition-colors"
        >
          🏪 View Store
        </Link>

        <button
          onClick={handleLogout}
          className="block w-full text-left text-red-400 hover:text-red-300 transition-colors"
        >
          🚪 Logout
        </button>
      </nav>
    </div>
  );
};

export default Slidebar;
