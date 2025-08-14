// Centralized API and asset base URLs
export const API_BASE = import.meta.env.VITE_API_URL || "/api";
// For image/static assets served by backend (strip trailing /api)
export const ASSETS_BASE = API_BASE.replace(/\/api$/, "");

export const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const jsonHeaders = () => ({
  "Content-Type": "application/json",
  ...authHeaders(),
});
