import React from "react";
import Slidebar from "./Slidebar";
import { useState, useEffect } from "react";
import { makeAdminRequest } from "../utils/authUtils";
import toast from "react-hot-toast";
import AdminProtectedRoute from "./AdminProtectedRoute";

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function getProducts() {
    try {
      const response = await makeAdminRequest("/getproducts");

      if (response.ok) {
        const result = await response.json();
        setProducts(result.data);
      } else {
        toast.error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Error loading dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <AdminProtectedRoute>
      <div className="flex">
        <Slidebar />
        <div className="flex-1 p-10 bg-gray-50 min-h-screen">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            Admin Dashboard 📊
          </h1>
          <div className="grid grid-cols-1">
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-semibold text-gray-700">
                Total Products
              </h2>
              {loading ? (
                <p className="text-lg mt-3 text-gray-500">Loading...</p>
              ) : (
                <p className="text-3xl mt-3 font-bold text-green-700">
                  {products.length}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  );
};

export default AdminDashboard;

