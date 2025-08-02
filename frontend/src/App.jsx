import React,{useEffect,useState} from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import AdminDashboard from "./admin/AdminDashboard";
import AdminProducts from "./admin/AdminProducts";
import AddProducts from "./admin/AddProducts";
import EditProducts from "./admin/EditProducts";
import Contact from "./pages/Contact";
import AdminQuery from "./admin/AdminQuery";
import AdminReply from "./admin/AdminReply";
import AnimatedLoadingBar from "./components/AnimatedLoadingBar";
import RouteLoader from "./components/RouteLoader";

const App = () => {
   const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1900);
    return () => clearTimeout(t);
  }, []);
  if (loading) {
    return <AnimatedLoadingBar />;
  }
  return (
    <div>
      <BrowserRouter>
        <RouteLoader />
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reg" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/admin/" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/addproduct" element={<AddProducts />} />
          <Route path="/admin/edit-product/:id" element={<EditProducts />} />
          <Route path="/admin/admin-query" element={<AdminQuery />} />
          <Route path="/admin/admin-reply/:id" element={<AdminReply />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
};

export default App;