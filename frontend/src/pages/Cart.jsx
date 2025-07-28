import React from "react";
import { FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaMinus, FaPlus } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { MdDelete } from "react-icons/md";
import {
  carttotalPrice,
  DecrementQuantity,
  deleteCartItem,
  IncrementQuantity,
  saveCart,
  fetchCart,
} from "../features/cartSlice/cartSlice";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const Cart = () => {
  const navigate = useNavigate();
  const [checkAuth, setCheckAuth] = useState(false);
  const cartData = useSelector((state) => state.Cart.cartItems);
  const cartAllValue = useSelector((state) => state.Cart);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(carttotalPrice());
  }, [cartData, dispatch]);

  useEffect(() => {
    let userId = localStorage.getItem("user");
    let token = localStorage.getItem("token");
    if (token && userId && cartData.length > 0) {
      dispatch(
        saveCart({
          userId: userId,
          cartItems: cartData,
          totalPrice: cartAllValue.TotalPrice,
          totalQuantity: cartAllValue.TotalQuantity,
        })
      );
    }
  }, [cartData, cartAllValue, dispatch]);

  useEffect(() => {
    let userId = localStorage.getItem("user");
    let token = localStorage.getItem("token");
    if (!token || !userId) {
      toast.error("Please login to view your cart.");
      navigate("/login");
      return;
    }
    if (userId) {
      dispatch(fetchCart(userId));
      setCheckAuth(true);
    } else {
      setCheckAuth(false);
    }
  }, [dispatch, navigate]);

  if (!checkAuth) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg relative mx-4">
          Loading Cart...
        </div>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 bg-black z-50 bg-opacity-90 backdrop-blur-sm flex justify-center items-center ">
      <div className="bg-slate-200 w-full max-w-2xl p-6 rounded-xl shadow-lg relative overflow-y-auto max-h-[90vh] mx-4">
        <button
          onClick={() => {
            navigate("/");
          }}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl"
        >
          <FaTimes />
        </button>
        <h2 className="text-2xl font-bold text-green-500 text-center mb-4">
          Your Cart 🛒
        </h2>
        {cartData.map((value, index) => (
          <ul className="divide-y divide-gray-300" key={index}>
            <li className="flex items-center gap-5 py-4">
              <img
                src={`/uploads/${value.ProductImage}`}
                alt="ProductImage"
                className="w-16 h-16 object-contain "
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-700">
                  {value.ProductName}
                </h3>

                <p className="text-sm text-gray-500">
                  ₹ {value.ProductPrice} each
                </p>
                <div className="flex items-center mt-2 gap-2">
                  <button
                    className="px-2 py-1 bg-green-200 rounded hover:bg-green-400"
                    onClick={() => {
                      dispatch(DecrementQuantity(value));
                    }}
                  >
                    <FaMinus />
                  </button>
                  <span className="px-2">
                    {value.quantity}
                    {value.quantity === 0
                      ? dispatch(deleteCartItem(value))
                      : ""}
                  </span>

                  <button
                    className="px-2 py-1 bg-green-200 rounded hover:bg-green-400"
                    onClick={() => {
                      dispatch(IncrementQuantity(value));
                    }}
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
              <p className="font-bold text-green-500">
                ₹ {value.quantity * value.ProductPrice}
              </p>
              <MdDelete
                className="text-gray-500 hover:text-red-500 text-xl hover:cursor-pointer"
                onClick={() => {
                  dispatch(deleteCartItem(value));
                }}
              />
            </li>
          </ul>
        ))}

        {/* Total */}
        <div className="mt-6 text-right">
          <p className="text-lg font-semibold text-gray-800">
            Total:-{" "}
            <span className="text-green-500">₹{cartAllValue.TotalPrice}</span>
          </p>
          <button className="mt-4 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-700 transition">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
