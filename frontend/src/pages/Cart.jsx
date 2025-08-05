import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaMinus, FaPlus } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { MdDelete } from "react-icons/md";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  carttotalPrice,
  DecrementQuantity,
  deleteCartItem,
  IncrementQuantity,
  saveCart,
  fetchCart,
  clearCart,
  loadUserCart,
} from "../features/cartSlice/cartSlice";
import toast from "react-hot-toast";

const Cart = () => {
  const navigate = useNavigate();
  const [checkAuth, setCheckAuth] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const cartData = useSelector((state) => state.Cart.cartItems);
  const cartAllValue = useSelector((state) => state.Cart);
  const { loading } = useSelector((state) => state.Cart);
  const dispatch = useDispatch();

  // Initialize cart on component mount
  useEffect(() => {
    const initializeCart = async () => {
      const userId = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!token || !userId) {
        // Clear any cart data for non-authenticated users
        dispatch(clearCart(null));
        toast.error("Please login to view your cart.");
        navigate("/login");
        return;
      }

      setCheckAuth(true);

      // Load user-specific cart from localStorage first
      dispatch(loadUserCart(userId));

      setIsInitialized(true);

      // If local cart is empty, try to fetch from backend
      const localCart = JSON.parse(
        localStorage.getItem(`localCart_${userId}`) || "[]"
      );
      if (localCart.length === 0) {
        try {
          console.log("Local cart is empty, fetching from backend...");
          await dispatch(fetchCart(userId)).unwrap();
        } catch (error) {
          console.error("Failed to fetch cart:", error);
          // Don't show error toast here, as it might be due to no cart existing yet
        }
      } else {
        console.log(
          "Local cart has items, preserving local state:",
          localCart.length,
          "items"
        );
      }
    };

    // Only run once on mount
    if (!isInitialized) {
      initializeCart();
    }
  }, [dispatch, navigate, isInitialized]); // Removed cartData from dependencies

  // Save cart to backend when cart changes (debounced)
  useEffect(() => {
    if (!isInitialized || !checkAuth) return;

    const userId = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (token && userId) {
      const saveTimeout = setTimeout(() => {
        // Only save if we're not in the middle of a delete operation
        console.log("Debounced save - Cart items:", cartData.length);
        dispatch(
          saveCart({
            userId: userId,
            cartItems: cartData,
            totalPrice: cartAllValue.TotalPrice,
            totalQuantity: cartAllValue.TotalQuantity,
          })
        );
      }, 2000); // Increased debounce to 2 seconds to reduce conflicts

      return () => clearTimeout(saveTimeout);
    }
  }, [
    cartData,
    cartAllValue.TotalPrice,
    cartAllValue.TotalQuantity,
    dispatch,
    isInitialized,
    checkAuth,
  ]);

  const handleClearCart = () => {
    dispatch(clearCart());
    toast.success("Cart cleared successfully!");
  };

  const handleDeleteItem = async (item) => {
    // Optimistically update the UI first
    dispatch(deleteCartItem(item));
    toast.success(`${item.ProductName} removed from cart`);

    // Immediately save to backend to prevent race conditions
    const userId = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (token && userId) {
      // Get the updated cart state after deletion
      const updatedCartItems = cartData.filter(
        (cartItem) => cartItem._id !== item._id
      );

      // Calculate new totals
      const newTotals = updatedCartItems.reduce(
        (acc, cartItem) => {
          const price = parseFloat(cartItem.ProductPrice) || 0;
          const quantity = parseInt(cartItem.quantity) || 0;
          acc.totalPrice += price * quantity;
          acc.totalQuantity += quantity;
          return acc;
        },
        { totalPrice: 0, totalQuantity: 0 }
      );

      // Immediately save the updated cart to backend
      try {
        await dispatch(
          saveCart({
            userId: userId,
            cartItems: updatedCartItems,
            totalPrice: parseFloat(newTotals.totalPrice.toFixed(2)),
            totalQuantity: newTotals.totalQuantity,
          })
        ).unwrap();
        console.log("Cart updated immediately after deletion");
      } catch (error) {
        console.error("Failed to save cart after deletion:", error);
        // Don't show error to user as the UI update already happened
      }
    }
  };

  const handleIncrementQuantity = (item) => {
    dispatch(IncrementQuantity(item));
  };

  const handleDecrementQuantity = (item) => {
    dispatch(DecrementQuantity(item));
  };

  function handlePayment() {
    const amount = cartAllValue.TotalPrice;
    const currency = "INR";
    const receipt = "receipet#1";

    fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: amount,
        currency: currency,
        receipt: receipt,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((order) => {
        const options = {
          key: "rzp_test_7uPWLRLgc2mdg9", // Replace with your RazorPay Key ID
          amount: order.amount,
          currency: order.currency,
          name: "Chopper Town",
          description: "Test Mode",
          order_id: order.id,
          handler: function (response) {
            let token = localStorage.getItem("token");
            let userID = localStorage.getItem("user");
            fetch("/api/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount,
                userID,
              }),
            })
              .then((res) => {
                return res.json();
              })
              .then((result) => {
                if (result.success) {
                  toast.success("Payment successful!");
                  dispatch(clearCart());
                  navigate("/");
                } else {
                  toast.error("Payment failed!");
                }
              })
              .catch((error) => {
                console.error("Payment verification error:", error);
                toast.error("Payment verification failed!");
              });
          },

          prefill: {
            name: "Abhishek Verma",
            email: "abhishek.verma@example.com",
            contact: "9433137660",
          },
          theme: {
            color: "#3399cc",
          },
          method: {
            upi: true,
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      })
      .catch((error) => {
        console.error("Order creation error:", error);
        toast.error("Failed to create order. Please try again.");
      });
  }

  if (!checkAuth || !isInitialized) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg relative mx-4">
          <LoadingSpinner size="medium" message="Loading cart..." />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 bg-opacity-90 backdrop-blur-sm flex justify-center items-center">
      <div className="bg-slate-200 w-full max-w-2xl p-6 rounded-xl shadow-lg relative overflow-y-auto max-h-[90vh] mx-4">
        <button
          onClick={() => navigate("/")}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl transition-colors"
        >
          <FaTimes />
        </button>

        {loading && (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="small" message="Updating cart..." />
          </div>
        )}

        {cartData.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-500 mb-4">
              Start shopping to add items to your cart
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {cartData.map((item, index) => (
                <div
                  key={`${item._id}-${index}`}
                  className="flex items-center gap-4 p-4 bg-white rounded-lg shadow"
                >
                  <img
                    src={`/uploads/${item.ProductImage}`}
                    alt={item.ProductName}
                    className="w-16 h-16 object-contain rounded"
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-700 line-clamp-2">
                      {item.ProductName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      ₹{item.ProductPrice} each
                    </p>

                    <div className="flex items-center mt-2 gap-2">
                      <button
                        onClick={() => handleDecrementQuantity(item)}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                        disabled={loading}
                      >
                        <FaMinus className="text-xs" />
                      </button>

                      <span className="px-3 py-1 bg-gray-100 rounded min-w-[40px] text-center">
                        {item.quantity || 1}
                      </span>

                      <button
                        onClick={() => handleIncrementQuantity(item)}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                        disabled={loading}
                      >
                        <FaPlus className="text-xs" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-green-500">
                      ₹
                      {(
                        (item.quantity || 1) * parseFloat(item.ProductPrice)
                      ).toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleDeleteItem(item)}
                      className="mt-2 text-red-500 hover:text-red-700 transition-colors"
                      disabled={loading}
                    >
                      <MdDelete className="text-xl" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-800">
                  Total ({cartAllValue.TotalQuantity} items):
                </span>
                <span className="text-2xl font-bold text-green-500">
                  ₹{cartAllValue.TotalPrice}
                </span>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                disabled={loading || cartData.length === 0}
                className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Proceed to Checkout"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
