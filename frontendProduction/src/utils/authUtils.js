import toast from "react-hot-toast";
import { API_BASE } from "./api";

// Utility function for making authenticated API calls
export const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  };

  // Normalize URL: if relative, prefix with API_BASE
  const finalUrl = /^(https?:)?\/\//.test(url)
    ? url
    : `${API_BASE}${url.startsWith("/") ? url : `/${url}`}`;

  try {
    const response = await fetch(finalUrl, defaultOptions);

    // If unauthorized, redirect to login
    if (response.status === 401 || response.status === 403) {
      const result = await response.json();

      if (result.requiresLogin) {
        // Clear tokens and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userName");
        window.location.href = "/login";
        throw new Error("Authentication required");
      }
    }

    return response;
  } catch (error) {
    console.error("Authenticated request failed:", error);
    throw error;
  }
};

// Specific function for admin API calls
export const makeAdminRequest = async (url, options = {}) => {
  try {
    return await makeAuthenticatedRequest(url, options);
  } catch (error) {
    // Handle admin-specific errors
    if (error.message.includes("Authentication required")) {
      toast.error("Admin session expired. Please login again.");
    }
    throw error;
  }
};
