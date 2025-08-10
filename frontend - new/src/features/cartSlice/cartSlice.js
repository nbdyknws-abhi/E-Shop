import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE, jsonHeaders } from "../../utils/api";

// Helper functions for localStorage backup
const saveCartToLocalStorage = (cartItems, userId = null) => {
  try {
    const key = userId ? `localCart_${userId}` : "localCart";
    localStorage.setItem(key, JSON.stringify(cartItems));
  } catch (error) {
    console.error("Failed to save cart to localStorage:", error);
  }
};

const loadCartFromLocalStorage = (userId = null) => {
  try {
    const key = userId ? `localCart_${userId}` : "localCart";
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to load cart from localStorage:", error);
    return [];
  }
};

const clearUserCartFromLocalStorage = (userId = null) => {
  try {
    const key = userId ? `localCart_${userId}` : "localCart";
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Failed to clear cart from localStorage:", error);
  }
};

export const saveCart = createAsyncThunk("cart/saveCart", async (cartData) => {
  const response = await fetch(`${API_BASE}/cart/save`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(cartData),
  });
  return await response.json();
});
export const fetchCart = createAsyncThunk("cart/fetch", async (userId) => {
  const response = await fetch(`${API_BASE}/cart/${userId}`, {
    method: "GET",
    headers: jsonHeaders(),
  });
  return await response.json();
});
const initialState = {
  cartItems: [], // Don't load from localStorage on init, will load after user login
  TotalPrice: 0,
  TotalQuantity: 0,
  loading: false,
  error: null,
};

export const cartSlice = createSlice({
  name: "Cart",
  initialState,
  reducers: {
    // New action to load user-specific cart from localStorage
    loadUserCart: (state, action) => {
      const userId = action.payload;

      // First clear any existing cart data to prevent mixing
      state.cartItems = [];
      state.TotalPrice = 0;
      state.TotalQuantity = 0;

      // Then load the user-specific cart
      const userCart = loadCartFromLocalStorage(userId);
      state.cartItems = userCart;
      cartSlice.caseReducers.carttotalPrice(state);

      console.log(`🔄 Loaded cart for user ${userId}:`, state.cartItems);
    },
    clearCart: (state, action) => {
      const userId = action.payload;

      // Clear Redux state completely
      state.cartItems = [];
      state.TotalQuantity = 0;
      state.TotalPrice = 0;

      // Clear user-specific localStorage
      clearUserCartFromLocalStorage(userId);

      console.log(`🧹 Cleared cart for user ${userId}`);
    },
    addToCart: (state, actions) => {
      console.log("Adding to cart:", actions.payload);
      const userId = localStorage.getItem("user");

      // Only allow adding to cart if user is logged in
      if (!userId) {
        console.warn("Cannot add to cart: User not logged in");
        return;
      }

      const existingItem = state.cartItems.find(
        (item) => item._id === actions.payload._id
      );

      if (existingItem) {
        console.log("Item exists, incrementing quantity");
        existingItem.quantity += 1;
      } else {
        console.log("New item, adding to cart");
        state.cartItems.push({ ...actions.payload, quantity: 1 });
      }

      console.log(`Cart items for user ${userId}:`, state.cartItems);

      // Recalculate totals immediately
      cartSlice.caseReducers.carttotalPrice(state);

      // Save to user-specific localStorage
      saveCartToLocalStorage(state.cartItems, userId);

      console.log("Cart totals after calculation:", {
        TotalPrice: state.TotalPrice,
        TotalQuantity: state.TotalQuantity,
      });
    },
    deleteCartItem: (state, actions) => {
      console.log("🗑️ Deleting item:", actions.payload._id);
      const userId = localStorage.getItem("user");
      const beforeCount = state.cartItems.length;

      state.cartItems = state.cartItems.filter(
        (item) => item._id !== actions.payload._id
      );

      const afterCount = state.cartItems.length;
      console.log(`🗑️ Cart count: ${beforeCount} → ${afterCount}`);

      // Recalculate totals
      cartSlice.caseReducers.carttotalPrice(state);

      // Save to user-specific localStorage
      saveCartToLocalStorage(state.cartItems, userId);

      console.log("🗑️ Item deleted, new cart state:", {
        itemCount: state.cartItems.length,
        totalPrice: state.TotalPrice,
        totalQuantity: state.TotalQuantity,
      });
    },
    carttotalPrice: (state) => {
      console.log("Calculating totals for items:", state.cartItems);

      const totals = state.cartItems.reduce(
        (acc, item) => {
          // Ensure we have valid numbers
          const price = parseFloat(item.ProductPrice) || 0;
          const quantity = parseInt(item.quantity) || 0;
          const itemTotal = price * quantity;

          console.log(
            `Item: ${item.ProductName}, Price: ${price}, Quantity: ${quantity}, ItemTotal: ${itemTotal}`
          );

          acc.totalPrice += itemTotal;
          acc.totalQuantity += quantity;
          return acc;
        },
        { totalPrice: 0, totalQuantity: 0 }
      );

      state.TotalPrice = parseFloat(totals.totalPrice.toFixed(2));
      state.TotalQuantity = totals.totalQuantity;

      console.log("Final totals:", {
        TotalPrice: state.TotalPrice,
        TotalQuantity: state.TotalQuantity,
      });
    },
    IncrementQuantity: (state, action) => {
      const userId = localStorage.getItem("user");
      const item = state.cartItems.find(
        (item) => item._id === action.payload._id
      );
      if (item) {
        item.quantity += 1;
        // Recalculate totals immediately
        cartSlice.caseReducers.carttotalPrice(state);
        // Save to user-specific localStorage
        saveCartToLocalStorage(state.cartItems, userId);
      }
    },
    DecrementQuantity: (state, action) => {
      const userId = localStorage.getItem("user");
      const item = state.cartItems.find(
        (item) => item._id === action.payload._id
      );
      if (item && item.quantity > 1) {
        item.quantity -= 1;
        // Recalculate totals immediately
        cartSlice.caseReducers.carttotalPrice(state);
        // Save to user-specific localStorage
        saveCartToLocalStorage(state.cartItems, userId);
      } else if (item && item.quantity === 1) {
        // Remove item if quantity becomes 0
        state.cartItems = state.cartItems.filter(
          (cartItem) => cartItem._id !== action.payload._id
        );
        // Recalculate totals immediately
        cartSlice.caseReducers.carttotalPrice(state);
        // Save to user-specific localStorage
        saveCartToLocalStorage(state.cartItems, userId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        console.log("🔄 fetchCart.fulfilled - Backend data:", action.payload);

        // Ensure we have the current user ID for proper isolation
        const currentUserId = localStorage.getItem("user");
        if (!currentUserId) {
          console.warn("🔄 No current user, skipping cart fetch");
          return;
        }

        if (action.payload && action.payload.cartItems) {
          // Get user-specific local cart
          const backendItems = action.payload.cartItems;
          const localItems = loadCartFromLocalStorage(currentUserId);

          if (localItems.length === 0) {
            // No local items, use backend data
            console.log("🔄 No local items, using backend data");
            state.cartItems = backendItems;
            state.TotalPrice = parseFloat(action.payload.totalPrice) || 0;
            state.TotalQuantity = parseInt(action.payload.totalQuantity) || 0;
          } else {
            // Merge local and backend items
            console.log("🔄 Merging local and backend items");
            const mergedItemsMap = new Map();

            // Add all local items first
            localItems.forEach((item) => {
              const key = `${item.productId || item._id}-${
                item.size || "default"
              }`;
              mergedItemsMap.set(key, { ...item });
            });

            // Add or update with backend items
            backendItems.forEach((item) => {
              const key = `${item.productId || item._id}-${
                item.size || "default"
              }`;
              const existingItem = mergedItemsMap.get(key);

              if (existingItem) {
                // Take the higher quantity
                mergedItemsMap.set(key, {
                  ...existingItem,
                  quantity: Math.max(existingItem.quantity, item.quantity),
                });
              } else {
                mergedItemsMap.set(key, { ...item });
              }
            });

            state.cartItems = Array.from(mergedItemsMap.values());
            console.log("🔄 Merged cart items:", state.cartItems);

            // Recalculate totals
            cartSlice.caseReducers.carttotalPrice(state);
          }

          // Save merged cart to user-specific localStorage
          saveCartToLocalStorage(state.cartItems, currentUserId);
        } else {
          // Backend returned empty cart, only clear if local is also empty
          if (state.cartItems.length === 0) {
            state.cartItems = [];
            state.TotalPrice = 0;
            state.TotalQuantity = 0;
          }
        }
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        console.log("Failed to fetch cart:", action.error.message);
      })
      .addCase(saveCart.pending, (state) => {
        // Don't set loading for save operations to avoid UI disruption
      })
      .addCase(saveCart.fulfilled, (state) => {
        console.log("Cart saved successfully to backend");
      })
      .addCase(saveCart.rejected, (state, action) => {
        state.error = action.error.message;
        console.error("Failed to save cart:", action.error.message);
      });
  },
});

export const {
  addToCart,
  deleteCartItem,
  carttotalPrice,
  IncrementQuantity,
  DecrementQuantity,
  clearCart,
  loadUserCart,
} = cartSlice.actions;
export default cartSlice.reducer;
