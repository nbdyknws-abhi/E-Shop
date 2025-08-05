import React from "react";
import Category from "./Category";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../features/cartSlice/cartSlice";
import { FaBoltLightning, FaCartPlus } from "react-icons/fa6";
import ImageZoom from "./ImageZoom";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import toast from "react-hot-toast";

const Products = () => {
  const [data, setData] = useState([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function Productsdata(SelectCategory = "All") {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/allproducts?category=${SelectCategory}`
      );
      const result = await response.json();

      if (response.ok) {
        setData(result.data || []);
      } else {
        setError(result.message || "Failed to fetch products");
        console.error("Failed to fetch products:", result.message);
      }
    } catch (error) {
      setError("Network error. Please check your connection.");
      console.error("Products fetch error:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddToCart = (item) => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user");

    if (!token || !userId) {
      toast.error("Please login to add items to cart");
      return;
    }

    try {
      dispatch(addToCart(item));
      toast.success(`${item.ProductName} added to cart!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart. Please try again.");
    }
  };

  useEffect(() => {
    Productsdata(category);
  }, [category]);

  if (loading) {
    return (
      <section className="py-10 px-6 max-w-7xl mx-auto">
        <Category onSelectCategory={setCategory} />
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="large" message="Loading products..." />
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 px-6 max-w-7xl mx-auto ">
      <Category onSelectCategory={setCategory} />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-600">
          {category} Products {data.length > 0 && `(${data.length})`}
        </h2>
      </div>

      {error && (
        <ErrorMessage
          message={error}
          onClose={() => setError("")}
          type="error"
        />
      )}

      {data.length === 0 && !loading && !error ? (
        <div className="text-center py-20">
          <div className="text-gray-400 text-6xl mb-4">🛍️</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No Products Found
          </h3>
          <p className="text-gray-500">
            Try selecting a different category or check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-7">
          {data.map((item) => (
            <div
              key={item._id}
              className="bg-gradient-to-r from-slate-700 to-neutral-900 shadow rounded-lg p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="mb-4">
                <ImageZoom
                  src={`/uploads/${item.ProductImage}`}
                  alt={item.ProductName}
                  className="w-full h-32 rounded"
                />
              </div>

              <h3
                className="mt-2 font-medium text-gray-200 line-clamp-2"
                title={item.ProductName}
              >
                {item.ProductName}
              </h3>

              <p className="text-teal-400 font-bold mt-1">
                ₹{item.ProductPrice}
              </p>

              <div className="flex flex-col gap-2 mt-3">
                <button
                  className="w-full bg-green-500 text-white font-semibold py-2 rounded hover:bg-green-600 transition-colors flex items-center justify-center"
                  onClick={() => handleAddToCart(item)}
                >
                  <FaCartPlus className="mr-2" />
                  Add To Cart
                </button>

                <button
                  className="w-full bg-yellow-500 text-black font-semibold py-2 rounded hover:bg-yellow-600 transition-colors flex items-center justify-center"
                  onClick={() => {
                    const token = localStorage.getItem("token");
                    const userId = localStorage.getItem("user");

                    if (!token || !userId) {
                      toast.error("Please login to add items to cart");
                      return;
                    }

                    handleAddToCart(item);
                    toast.success("Added to cart! Redirecting to checkout...");

                    // Navigate to cart page after a short delay
                    setTimeout(() => {
                      navigate("/cart");
                    }, 500);
                  }}
                >
                  <FaBoltLightning className="mr-2" />
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Products;
