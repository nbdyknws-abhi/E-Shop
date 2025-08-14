import React, { useState } from "react";
import { FaTimes, FaUser, FaUserShield } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { clearCart, loadUserCart } from "../features/cartSlice/cartSlice";
import { API_BASE } from "../utils/api";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState("user"); // "user" or "admin"
  const [formData, setFormData] = useState({ LoginEmail: "", LoginPass: "" });

  async function handleForm(e) {
    e.preventDefault();

    // Handle form submission based on user type
    try {
      let endpoint = `${API_BASE}/userdata`; // Default user login

      // For admin login, we can still use the same endpoint but with different handling
      if (userType === "admin") {
        // Check if admin credentials are provided
        if (formData.LoginEmail !== "admin@gmail.com") {
          toast.error("Please use admin email for admin login");
          return;
        }
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = "Login failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If JSON parsing fails, use status text
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        toast.error(errorMessage);
        return;
      }

      const result = await response.json();

      // Clear any existing cart data first
      dispatch(clearCart(null));

      if (result.data && result.data.userEmail === "admin@gmail.com") {
        if (userType !== "admin") {
          toast.error("Please select 'Admin' login type for admin account");
          return;
        }

        // Store admin authentication data
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", result.data._id);
        localStorage.setItem("userName", result.data.userName);
        localStorage.setItem("userType", "admin");

        navigate("/admin/");
        toast.success("Welcome Admin! ");
      } else {
        if (userType === "admin") {
          toast.error("Invalid admin credentials");
          return;
        }

        // Clear any existing cart data first to prevent mixing
        dispatch(clearCart(null));

        // Store user data
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", result.data._id);
        localStorage.setItem("userName", result.data.userName);
        localStorage.setItem("userType", "user"); 
        // Load user-specific cart
        dispatch(loadUserCart(result.data._id));

        toast.success(`Welcome ${result.data.userName}! 🎉`);
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      toast.error("An error occurred while logging in.");
    }
  }
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg relative mx-4">
        <button
          onClick={() => {
            navigate("/");
          }}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl"
        >
          <FaTimes />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-green-600 text-center">
          {userType === "admin" ? "Admin Login 🔐" : "Login To Continue 🗿"}
        </h2>

        {/* User Type Toggle */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setUserType("user")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
              userType === "user"
                ? "bg-white text-green-600 shadow-sm font-medium"
                : "text-gray-600 hover:text-green-600"
            }`}
          >
            <FaUser className="text-sm" />
            User Login
          </button>
          <button
            type="button"
            onClick={() => setUserType("admin")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
              userType === "admin"
                ? "bg-white text-green-600 shadow-sm font-medium"
                : "text-gray-600 hover:text-green-600"
            }`}
          >
            <FaUserShield className="text-sm" />
            Admin Login
          </button>
        </div>

        {/* Admin Info Banner */}
        {userType === "admin" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-600">
                <FaUserShield />
                <span className="text-sm font-medium">
                  Admin access required
                </span>
              </div>
            </div>
          </div>
        )}
        <form action="" onSubmit={handleForm}>
          <label htmlFor="" className="block text-sm text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            name="LoginEmail"
            placeholder={
              userType === "admin" ? "super@example.com" : "you@example.com"
            }
            id=""
            value={formData.LoginEmail}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <label htmlFor="" className="block text-sm text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "password" : "text"}
              name="LoginPass"
              placeholder="*******"
              id=""
              value={formData.LoginPass}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="button"
              onClick={() => {
                setShowPassword(!showPassword);
              }}
              className="absolute top-4 right-3 text-gray-500 hover:text-green-600"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button
            type="submit"
            className={`w-full font-semibold py-2 mt-6 rounded transition-colors ${
              userType === "admin"
                ? "bg-blue-600 hover:bg-blue-800 text-white"
                : "bg-green-600 hover:bg-green-800 text-white"
            }`}
          >
            {userType === "admin" ? "Admin Login 🔐" : "User Login 🚀"}
          </button>
        </form>

        {/* Different bottom text for admin vs user */}
        {userType === "user" ? (
          <p className="text-sm text-center text-gray-600 mt-5">
            Don't have an account?{" "}
            <Link to={"/reg"} className="text-green-600 hover:underline">
              Register
            </Link>
          </p>
        ) : (
          <p className="text-sm text-center text-gray-600 mt-5">
            Need user account?{" "}
            <button
              onClick={() => setUserType("user")}
              className="text-green-600 hover:underline"
            >
              Switch to User Login
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
