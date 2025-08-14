import { useState, useEffect } from "react";
import { FaTimes, FaMinus, FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import LoadingSpinner from "../components/LoadingSpinner";
import { API_BASE, ASSETS_BASE, authHeaders } from "../utils/api";
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
  const dispatch = useDispatch();

  const [checkAuth, setCheckAuth] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const cartData = useSelector((state) => state.Cart.cartItems);
  const cartAllValue = useSelector((state) => state.Cart);
  const { loading } = useSelector((state) => state.Cart);

  // =============================
  // INITIALIZE CART ON MOUNT
  // =============================
  useEffect(() => {
    const initializeCart = async () => {
      const userId = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!token || !userId) {
        dispatch(clearCart(null));
        toast.error("Please login to view your cart.");
        navigate("/login");
        return;
      }

      setCheckAuth(true);

      // Load from localStorage first
      dispatch(loadUserCart(userId));
      setIsInitialized(true);

      // Fetch from backend if local cart is empty
      const localCart = JSON.parse(
        localStorage.getItem(`localCart_${userId}`) || "[]"
      );
      if (localCart.length === 0) {
        try {
          await dispatch(fetchCart(userId)).unwrap();
        } catch (error) {
          console.error("Failed to fetch cart:", error);
        }
      }
    };

    if (!isInitialized) {
      initializeCart();
    }
  }, [dispatch, navigate, isInitialized]);

  // =============================
  // AUTO-SAVE CART (DEBOUNCED)
  // =============================
  useEffect(() => {
    if (!isInitialized || !checkAuth) return;

    const userId = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (token && userId) {
      const saveTimeout = setTimeout(() => {
        dispatch(
          saveCart({
            userId: userId,
            cartItems: cartData,
            totalPrice: cartAllValue.TotalPrice,
            totalQuantity: cartAllValue.TotalQuantity,
          })
        );
      }, 2000);

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

  // =============================
  // CART ACTIONS
  // =============================
  const handleIncrementQuantity = (item) => {
    dispatch(IncrementQuantity(item));
  };

  const handleDecrementQuantity = (item) => {
    dispatch(DecrementQuantity(item));
  };

  const handleDeleteItem = async (item) => {
    // Optimistic update
    dispatch(deleteCartItem(item));
    toast.success(`${item.ProductName} removed from cart`);

    const userId = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (token && userId) {
      const updatedCartItems = cartData.filter(
        (cartItem) => cartItem._id !== item._id
      );

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

      try {
        await dispatch(
          saveCart({
            userId: userId,
            cartItems: updatedCartItems,
            totalPrice: parseFloat(newTotals.totalPrice.toFixed(2)),
            totalQuantity: newTotals.totalQuantity,
          })
        ).unwrap();
      } catch (error) {
        console.error("Failed to save cart after deletion:", error);
      }
    }
  };

  const handlePayment = () => {
    const amount = Number((cartAllValue.TotalPrice || 0).toFixed(2));
    const currency = "INR";
    const receipt = "receipet#1";

    if (!amount || amount < 1) {
      toast.error("Minimum payable amount is INR 1.00");
      return;
    }

    fetch(`${API_BASE}/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, currency, receipt }),
    })
      .then((res) => res.json())
      .then((order) => {
        const options = {
          key: import.meta.env.VITE_RZP_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: "Chopper Town",
          description: "Test Mode",
          order_id: order.id,
          handler: function (response) {
            const userID = localStorage.getItem("user");
            fetch(`${API_BASE}/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json", ...authHeaders() },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount,
                userID,
              }),
            })
              .then((res) => res.json())
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
            name: localStorage.getItem("userName") || "Guest",
            email: "",
            contact: "",
          },
          theme: { color: "#3399cc" },
          method: { upi: true },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      })
      .catch((error) => {
        console.error("Order creation error:", error);
        toast.error("Failed to create order. Please try again.");
      });
  };

  // =============================
  // LOADING OVERLAY WHILE INIT
  // =============================
  if (!checkAuth || !isInitialized) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg relative mx-4">
          <LoadingSpinner size="medium" message="Loading cart..." />
        </div>
      </div>
    );
  }

  // =============================
  // MAIN RENDER
  // =============================
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
                    src={`${ASSETS_BASE}/uploads/${item.ProductImage}`}
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
