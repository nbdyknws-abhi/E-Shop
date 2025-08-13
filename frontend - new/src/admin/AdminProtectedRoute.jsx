import React, { useEffect, useState } from "react";
import { API_BASE } from "../utils/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const AdminProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      const userName = localStorage.getItem("userName");

      // Check if user is logged in
      if (!token) {
        toast.error("Please login as admin to access this area");
        navigate("/login");
        return;
      }

      // Check if user is admin by trying to access a protected admin endpoint
      const response = await fetch(`${API_BASE}/getproducts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsAuthorized(true);
        console.log("✅ Admin access verified");
      } else {
        const result = await response.json();

        if (result.requiresLogin) {
          toast.error("Admin access denied. Please login as admin.");
          // Clear any existing tokens
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("userName");
          localStorage.removeItem("userType");
          navigate("/login");
        } else {
          toast.error("Access denied. Admin privileges required.");
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Admin auth check failed:", error);
      toast.error("Authentication failed. Please login again.");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600">Admin privileges required</p>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminProtectedRoute;

