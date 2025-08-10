import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaTimes, FaMapMarkerAlt, FaUser, FaPhone } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { clearCart } from "../features/cartSlice/cartSlice";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import { API_BASE, ASSETS_BASE, authHeaders } from "../utils/api";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartData = useSelector((state) => state.Cart.cartItems);
  const cartAllValue = useSelector((state) => state.Cart);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [profileLoading, setProfileLoading] = useState(true);

  // Fetch user profile data to auto-fill form
  const fetchUserProfile = async (userId, token) => {
    try {
      const response = await fetch(`${API_BASE}/user/profile/${userId}`, {
        headers: { ...authHeaders() },
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.user;

        // Auto-fill form with profile data
        setFormData({
          fullName: user.userName || "",
          phoneNumber: user.phoneNumber || "",
          address: user.address || "",
          city: user.city || "",
          state: user.state || "",
          pincode: user.pincode || "",
          landmark: "", // Landmark is checkout-specific
        });

        // Show appropriate message based on completeness
        const hasBasicInfo = user.userName && user.phoneNumber && user.address;
        const hasCompleteAddress =
          hasBasicInfo && user.city && user.state && user.pincode;

        if (hasCompleteAddress) {
          toast.success("✅ Complete profile details loaded!");
        } else if (hasBasicInfo) {
          toast.success(
            "📋 Basic profile details loaded. Please complete address."
          );
        } else {
          toast.info("ℹ️ Please fill in your delivery details");
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Don't show error toast as it's not critical
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !userId) {
      toast.error("Please login to checkout");
      navigate("/login");
      return;
    }

    if (cartData.length === 0) {
      navigate("/");
      return;
    }

    // Fetch user profile to auto-fill form
    fetchUserProfile(userId, token);
  }, [navigate, cartData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.phoneNumber.trim())
      errors.phoneNumber = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(formData.phoneNumber))
      errors.phoneNumber = "Enter valid 10-digit phone number";
    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.state.trim()) errors.state = "State is required";
    if (!formData.pincode.trim()) errors.pincode = "Pincode is required";
    else if (!/^[0-9]{6}$/.test(formData.pincode))
      errors.pincode = "Enter valid 6-digit pincode";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculateShipping = () => {
    // Free shipping for orders above ₹500
    return cartAllValue.TotalPrice >= 500 ? 0 : 50;
  };

  const shippingCost = calculateShipping();
  const finalTotal = cartAllValue.TotalPrice + shippingCost;

  const handlePayment = async () => {
    if (!validateForm()) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    setLoading(true);

    try {
      const amount = finalTotal;
      const currency = "INR";
      const receipt = `receipt_${Date.now()}`;

      // Create Razorpay order
      const response = await fetch(`${API_BASE}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount,
          currency: currency,
          receipt: receipt,
        }),
      });

      const order = await response.json();

      const options = {
        key: import.meta.env.VITE_RZP_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Chopper Town",
        description: "Order Payment",
        order_id: order.id,
        handler: async function (response) {
          try {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("user");

            const verifyResponse = await fetch(
              `${API_BASE}/verify-and-create-order`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...authHeaders(),
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  userId,
                  cartItems: cartData,
                  shippingAddress: formData,
                  subtotal: cartAllValue.TotalPrice,
                  shippingCost,
                  totalAmount: finalTotal,
                  totalQuantity: cartAllValue.TotalQuantity,
                }),
              }
            );

            const result = await verifyResponse.json();

            if (result.success) {
              dispatch(clearCart(userId));
              toast.success("Order placed successfully! 🎉");
              navigate("/my-orders");
            } else {
              toast.error("Order creation failed!");
            }
          } catch (error) {
            console.error("Order creation error:", error);
            toast.error("Order processing failed!");
          }
        },
        prefill: {
          name: formData.fullName,
          contact: formData.phoneNumber,
        },
        theme: {
          color: "#22c55e",
        },
        method: {
          upi: true,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to initialize payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-lg relative overflow-y-auto max-h-[95vh]">
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-xl z-10"
        >
          <FaTimes />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-green-600 mb-6 text-center">
            Checkout 🛒
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Shipping Information Form */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FaMapMarkerAlt className="text-green-500" />
                Delivery Information
              </h3>

              {profileLoading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-600">
                    <LoadingSpinner size="small" />
                    <span className="text-sm">
                      Loading your profile details...
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      formErrors.fullName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your full name"
                  />
                  {formErrors.fullName && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      formErrors.phoneNumber
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="10-digit mobile number"
                  />
                  {formErrors.phoneNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.phoneNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      formErrors.address ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="House/Flat no., Street, Area"
                  />
                  {formErrors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        formErrors.city ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="City"
                    />
                    {formErrors.city && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        formErrors.state ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="State"
                    />
                    {formErrors.state && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.state}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        formErrors.pincode
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="6-digit pincode"
                    />
                    {formErrors.pincode && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.pincode}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Landmark
                    </label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Near landmark (optional)"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Order Summary</h3>

              <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                {cartData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 py-2 border-b border-gray-200 last:border-b-0"
                  >
                    <img
                      src={`${ASSETS_BASE}/uploads/${item.ProductImage}`}
                      alt={item.ProductName}
                      className="w-12 h-12 object-contain rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">
                        {item.ProductName}
                      </p>
                      <p className="text-xs text-gray-500">
                        ₹{item.ProductPrice} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-bold">
                      ₹{(item.ProductPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({cartAllValue.TotalQuantity} items):</span>
                  <span>₹{cartAllValue.TotalPrice}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Shipping:</span>
                  <span
                    className={
                      shippingCost === 0 ? "text-green-600 font-medium" : ""
                    }
                  >
                    {shippingCost === 0 ? "FREE" : `₹${shippingCost}`}
                  </span>
                </div>

                {cartAllValue.TotalPrice < 500 && (
                  <p className="text-xs text-gray-500">
                    Add ₹{(500 - cartAllValue.TotalPrice).toFixed(2)} more for
                    FREE shipping
                  </p>
                )}

                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-green-600">
                    ₹{finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="small" />
                    Processing...
                  </div>
                ) : (
                  `Pay ₹${finalTotal.toFixed(2)}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
