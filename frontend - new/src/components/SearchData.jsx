import React from "react";
import { useEffect, useState } from "react";
import { API_BASE, ASSETS_BASE } from "../utils/api";
import { FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function SearchData({ onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleClose = () => {
    // Restore body scroll before closing
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    onClose(false);
  };

  // Prevent body scroll when search modal is open
  useEffect(() => {
    // Save original overflow style
    const originalOverflow = document.body.style.overflow;

    // Disable scroll on body
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden"; // Also prevent html scroll

    // Handle escape key
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = originalOverflow;
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim()) {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        // Build headers conditionally
        const headers = {
          "Content-Type": "application/json",
        };

        // Only add Authorization header if token exists
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        fetch(`${API_BASE}/search?q=${query}`, {
          headers,
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
          })
          .then((result) => {
            setResults(result.data || []);
            setLoading(false);
          })
          .catch((err) => {
            console.error("Error fetching search results:", err);
            setError("Failed to search. Please try again.");
            setResults([]);
            setLoading(false);
          });
      } else {
        setResults([]);
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleProductClick = (product) => {
    // Restore body scroll before closing
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";

    // You can navigate to a product detail page or add to cart
    console.log("Product clicked:", product);
    onClose(false);
    // Navigate to home and scroll to products section
    navigate("/");
    toast.success(`Showing ${product.ProductName}`);
  };

  return (
    <div
      className="fixed inset-0 bg-white z-[1000] flex flex-col"
      onClick={(e) => {
        // Only close if clicking the backdrop (not the content)
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="flex-1 overflow-y-auto">
        {/* Search Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10 shadow-sm">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800">
              Search Products
            </h2>
            <button
              className="text-gray-500 hover:text-red-500 transition-colors p-2 hover:bg-gray-100 rounded-full"
              onClick={handleClose}
            >
              <FaTimes className="text-2xl" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="px-6 py-6 bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
            <input
              type="text"
              placeholder="Search for products, brands and more..."
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-6 py-4 text-lg border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="px-6 py-6 min-h-[60vh] pb-16">
          <div className="max-w-7xl mx-auto">
            {/* Loading State */}
            {loading && (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                <p className="mt-4 text-lg text-gray-600">Searching...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-20">
                <div className="text-8xl mb-6">❌</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Search Error
                </h3>
                <p className="text-red-600 text-lg">{error}</p>
              </div>
            )}

            {/* Search Results */}
            {!loading && !error && results.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Found {results.length} result(s) for "{query}"
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {results.map((item) => (
                    <div
                      key={item._id}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-green-300 hover:scale-105 bg-white"
                      onClick={() => handleProductClick(item)}
                    >
                      <div className="text-center">
                        <img
                          src={`${ASSETS_BASE}/uploads/${item.ProductImage}`}
                          alt={item.ProductName}
                          className="w-24 h-24 object-contain rounded-lg bg-gray-50 mx-auto mb-4"
                        />
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                          {item.ProductName}
                        </h3>
                        <p className="text-sm text-gray-600 capitalize mb-2">
                          Category: {item.ProductCat}
                        </p>
                        <p className="text-xl font-bold text-green-600 mb-3">
                          ₹{item.ProductPrice}
                        </p>
                        <span className="inline-block px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          {item.ProductStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {!loading &&
              !error &&
              query.trim() !== "" &&
              results.length === 0 && (
                <div className="text-center py-20">
                  <div className="text-8xl mb-6">🔍</div>
                  <h3 className="text-2xl font-semibold text-gray-600 mb-4">
                    No results found for "{query}"
                  </h3>
                  <p className="text-gray-500 text-lg">
                    Try searching with different keywords or check your spelling
                  </p>
                </div>
              )}

            {/* Empty State */}
            {!loading && !error && query.trim() === "" && (
              <div className="text-center py-20">
                <div className="text-8xl mb-6">🛍️</div>
                <h3 className="text-2xl font-semibold text-gray-600 mb-4">
                  Start searching for products
                </h3>
                <p className="text-gray-500 text-lg mb-8">
                  Type in the search box above to find amazing products
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-md mx-auto text-sm text-gray-400">
                  <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="text-2xl mb-1">📱</div>
                    Electronics
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="text-2xl mb-1">👕</div>
                    Fresh
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="text-2xl mb-1">🏠</div>
                    Home
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="text-2xl mb-1">⚽</div>
                    Toys
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchData;
