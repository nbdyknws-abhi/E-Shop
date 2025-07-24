import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const saveCart = createAsyncThunk("cart/saveCart", async (cartData) => {
  const response = await fetch("/api/cart/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cartData),
  });
  return await response.json();
});
export const fetchCart = createAsyncThunk("cart/fetch", async (userId) => {
  const response = await fetch(`/api/cart/${userId}`);
  return await response.json();
});
const initialState = {
  cartItems: [],
  TotalPrice: 0,
  TotalQuantity: 0,
};

export const cartSlice = createSlice({
  name: "Cart",
  initialState,
  reducers: {
    addToCart: (state, actions) => {
      const find = state.cartItems.findIndex((value) => {
        return value._id === actions.payload._id;
      });

      if (find != -1) {
        state.cartItems[find] = {
          ...state.cartItems[find],
          quantity: state.cartItems[find].quantity + 1,
        };
      } else {
        state.cartItems.push({ ...actions.payload, quantity: 1 });
      }
    },
    deleteCartItem: (state, actions) => {
      state.cartItems = state.cartItems.filter((value) => {
        return value._id !== actions.payload._id;
      });
    },
    carttotalPrice: (state) => {
      const { totalPrice, totalQuantity } = state.cartItems.reduce(
        (cartTotal, cartItem) => {
          const { quantity, ProductPrice } = cartItem;
          const itemsTotal = parseFloat(ProductPrice) * parseFloat(quantity);
          cartTotal.totalPrice += itemsTotal;
          cartTotal.totalQuantity += quantity;
          return cartTotal;
        },
        {
          totalPrice: 0,
          totalQuantity: 0,
        }
      );
      state.TotalPrice = totalPrice.toFixed(2);
      state.TotalQuantity = totalQuantity;
    },
    IncrementQuantity: (state, action) => {
      state.cartItems = state.cartItems.map((item) => {
        if (item._id === action.payload._id) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      });
    },
    DecrementQuantity: (state, action) => {
      state.cartItems = state.cartItems.map((item) => {
        if (item._id === action.payload._id) {
          return {
            ...item,
            quantity: item.quantity > 1 ? item.quantity - 1 : 0,
          };
        }
        return item;
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      console.log("fetch success", action.payload);
    });
    builder.addCase(saveCart.fulfilled, (state, action) => {
      console.log("save success", action.payload);
    });
  },
});

export const {
  addToCart,
  deleteCartItem,
  carttotalPrice,
  IncrementQuantity,
  DecrementQuantity,
} = cartSlice.actions;
export default cartSlice.reducer;
