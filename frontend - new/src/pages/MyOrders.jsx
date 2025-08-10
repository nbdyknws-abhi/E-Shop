import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBox,
  FaTruck,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
} from "react-icons/fa";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import { API_BASE, ASSETS_BASE, authHeaders } from "../utils/api";

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const userId = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!token || !userId) {
        toast.error("Please login to view your orders");
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/orders/${userId}`, {
          headers: { ...authHeaders() },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched orders:", data); // Debug log
          setOrders(data.orders || []);
        } else {
          toast.error("Failed to fetch orders");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Error loading orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "confirmed":
        return "text-blue-600 bg-blue-100";
      case "processing":
        return "text-purple-600 bg-purple-100";
      case "shipped":
        return "text-orange-600 bg-orange-100";
      case "delivered":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
      case "confirmed":
      case "processing":
        return <FaBox className="w-4 h-4" />;
      case "shipped":
        return <FaTruck className="w-4 h-4" />;
      case "delivered":
        return <FaCheckCircle className="w-4 h-4" />;
      default:
        return <FaBox className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper function to handle different order formats (new vs legacy)
  const normalizeOrder = (order) => {
    // If it's a new order with items array, return as is
    if (order.items && Array.isArray(order.items)) {
      return order;
    }

    // For legacy orders, create a default structure
    return {
      ...order,
      items: [], // Empty items array for legacy orders
      shippingAddress: order.shippingAddress || {},
      subtotal: order.subtotal || order.amount || 0,
      totalAmount: order.totalAmount || order.amount || 0,
      totalQuantity: order.totalQuantity || 0,
      shippingCost: order.shippingCost || 0,
      paymentMethod: order.paymentMethod || "Razorpay",
      paymentStatus: order.paymentStatus || "completed",
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <LoadingSpinner size="large" message="Loading your orders..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <button
            onClick={() => navigate("/")}
            className="text-green-600 hover:text-green-700 mb-4 flex items-center gap-2"
          >
            ← Back to Home
          </button>
          <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
          <p className="text-gray-600 mt-2">Track and manage your orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No orders yet
            </h3>
            <p className="text-gray-500 mb-4">
              Start shopping to see your orders here
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((orderData) => {
              const order = normalizeOrder(orderData); // Normalize the order structure
              return (
                <div
                  key={order._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Order #{order.orderId}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Placed on{" "}
                          {formatDate(order.createdAt || order.createAt)}
                        </p>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-800 mb-3">
                          Order Items
                        </h4>
                        <div className="space-y-3">
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                              >
                                <img
                                  src={`${ASSETS_BASE}/uploads/${item.productImage}`}
                                  alt={item.productName}
                                  className="w-16 h-16 object-contain rounded"
                                />
                                <div className="flex-1">
                                  <p className="font-medium text-sm line-clamp-2">
                                    {item.productName}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    ₹{item.productPrice} × {item.quantity}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-green-600">
                                    ₹
                                    {item.totalPrice?.toFixed(2) ||
                                      (
                                        item.productPrice * item.quantity
                                      ).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-lg text-center text-gray-500">
                              <p>No item details available</p>
                              <p className="text-xs mt-1">
                                This order was placed before the detailed
                                tracking system was implemented.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Shipping & Payment Info */}
                      <div className="space-y-4">
                        {/* Shipping Address */}
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                            <FaMapMarkerAlt className="text-green-500" />
                            Shipping Address
                          </h4>
                          <div className="bg-gray-50 p-3 rounded-lg text-sm">
                            {order.shippingAddress ? (
                              <>
                                <p className="font-medium flex items-center gap-2">
                                  <FaUser className="text-gray-500" />
                                  {order.shippingAddress.fullName || "N/A"}
                                </p>
                                <p className="flex items-center gap-2 mt-1">
                                  <FaPhone className="text-gray-500" />
                                  {order.shippingAddress.phoneNumber || "N/A"}
                                </p>
                                <p className="mt-2 text-gray-700">
                                  {order.shippingAddress.address || "N/A"}
                                </p>
                                <p className="text-gray-700">
                                  {order.shippingAddress.city || "N/A"},{" "}
                                  {order.shippingAddress.state || "N/A"} -{" "}
                                  {order.shippingAddress.pincode || "N/A"}
                                </p>
                                {order.shippingAddress.landmark && (
                                  <p className="text-gray-600 text-xs mt-1">
                                    Near: {order.shippingAddress.landmark}
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="text-gray-500">
                                Shipping address not available
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Order Summary */}
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">
                            Order Summary
                          </h4>
                          <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                            <div className="flex justify-between">
                              <span>
                                Subtotal ({order.totalQuantity || 0} items):
                              </span>
                              <span>₹{(order.subtotal || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Shipping:</span>
                              <span>
                                {(order.shippingCost || 0) === 0
                                  ? "FREE"
                                  : `₹${order.shippingCost}`}
                              </span>
                            </div>
                            <div className="flex justify-between font-bold text-base pt-2 border-t">
                              <span>Total:</span>
                              <span className="text-green-600">
                                ₹
                                {(
                                  order.totalAmount ||
                                  order.amount ||
                                  0
                                ).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Payment Info */}
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">
                            Payment Details
                          </h4>
                          <div className="bg-gray-50 p-3 rounded-lg text-sm">
                            <p>
                              Payment Method:{" "}
                              {order.paymentMethod || "Razorpay"}
                            </p>
                            <p>Payment ID: {order.paymentId || "N/A"}</p>
                            <p className="text-green-600 font-medium">
                              Status:{" "}
                              {order.paymentStatus === "completed"
                                ? "Paid"
                                : order.status || "Paid"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expected Delivery */}
                    {order.expectedDelivery && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          Expected Delivery:{" "}
                          {formatDate(order.expectedDelivery)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
