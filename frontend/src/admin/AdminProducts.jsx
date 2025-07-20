import React from "react";
import Slidebar from "./Slidebar";
import { Link } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { useState } from "react";
import { useEffect } from "react";
import toast from "react-hot-toast";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  async function getProducts() {
    try {
      const response = await fetch("/api/getproducts");
      const result = await response.json();
      setProducts(result.data);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    getProducts();
  }, []);
  async function handleDelete(id) {
    try {
      const response = await fetch(`/api/deleteproduct/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();
      if (response.ok) {
        setProducts(products.filter((item) => item._id !== id));
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      console.log(result);
    } catch (error) {
      toast.error(error.message);
    }
  }
  return (
    <div className="flex mt-16">
      <Slidebar />
      <div className="flex-1 p-10 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Manage Products 📊
        </h1>
        <Link to={"/admin/addproduct"}>
          <button className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 transition">
            <FaPlus /> Add Products
          </button>
        </Link>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-5">
          {products.map((items, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-slate-700 to-neutral-900 shadow rounded-lg p-4 hover:shadow-lg transition"
            >
              <img
                src={`/uploads/${items.ProductImage}`}
                alt="Product Image"
                className="w-full h-40 object-contain rounded-md mb-4 border"
              />
              <h3 className="text-xl font-semibold text-neutral-100">
                {items.ProductName}
              </h3>
              <p className="text-sm text-gray-100">
                Category:- {items.ProductCat}
              </p>
              <p className="text-green-500 font-bold mt-1">
                ₹{items.ProductPrice}
              </p>
              <p
                className={`font-semibold mt-1 ${items.ProductStatus === "In-Stock"
                    ? "text-teal-300"
                    : "text-red-600"
                  }`}
              >
                {items.ProductStatus}
              </p>
              <div className="flex flex-col sm:flex-row justify-between mt-4">
                <Link
                  to={`/admin/edit-product/${items._id}`}
                  className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
                >
                  <FaEdit /> Edit
                </Link>
                <Link
                  onClick={() => handleDelete(items._id)}
                  className="flex items-center gap-2 text-red-500 hover:text-red-700"
                >
                  <FaTrash /> Delete
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
