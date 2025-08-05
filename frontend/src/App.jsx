import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyProfile from "./pages/MyProfile";
import MyOrders from "./components/MyOrders";
import AdminDashboard from "./admin/AdminDashboard";
import AdminProducts from "./admin/AdminProducts";
import AddProducts from "./admin/AddProducts";
import EditProducts from "./admin/EditProducts";
import Contact from "./pages/Contact";
import AdminQuery from "./admin/AdminQuery";
import AdminReply from "./admin/AdminReply";
import AnimatedLoadingBar from "./components/AnimatedLoadingBar";
import RouteLoader from "./components/RouteLoader";
import NotFound from "./pages/NotFound";
import Breadcrumb from "./components/Breadcrumb";
// import CartDebugger from "./components/CartDebugger";

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial app setup (could check for auth, load critical data, etc.)
    const initApp = async () => {
      // Minimum loading time for smooth UX (prevents flash)
      const minLoadTime = new Promise((resolve) => setTimeout(resolve, 600));

      // Add any actual initialization here
      // e.g., check authentication, load critical data

      await minLoadTime;
      setLoading(false);
    };

    initApp();
  }, []);

  if (loading) {
    return <AnimatedLoadingBar />;
  }
  return (
    <div>
      <BrowserRouter>
        <RouteLoader />
        <Navbar />
        <Breadcrumb />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reg" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/admin/" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/addproduct" element={<AddProducts />} />
          <Route path="/admin/edit-product/:id" element={<EditProducts />} />
          <Route path="/admin/admin-query" element={<AdminQuery />} />
          <Route path="/admin/admin-reply/:id" element={<AdminReply />} />

          {/* 404 Route - Must be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />

        {/* Temporary debug component - remove in production */}
        {/* <CartDebugger /> */}
      </BrowserRouter>
    </div>
  );
};

export default App;
