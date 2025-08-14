import React, { useEffect, useState, useMemo } from "react";
import {
  FiPackage,
  FiUser,
  FiMapPin,
  FiClock,
  FiTruck,
  FiShoppingCart,
  FiHash,
} from "react-icons/fi";
import Slidebar from "./Slidebar";
import AdminProtectedRoute from "./AdminProtectedRoute";
import { makeAdminRequest } from "../utils/authUtils";
import toast from "react-hot-toast";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const readableStatus = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(25);
  const [statusFilter, setStatusFilter] = useState("");
  // Removed status update actions
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(() => new Set());

  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const fetchOrders = async (pageArg = page, statusArg = statusFilter) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: pageArg, limit });
      if (statusArg) qs.append("status", statusArg);
      const res = await makeAdminRequest(`/orders?${qs.toString()}`);
      let data = null;
      const contentType = res.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      if (isJson) {
        try {
          data = await res.json();
        } catch (e) {
          console.warn("Failed to parse JSON for /orders response", e);
        }
      }

      if (res.ok && data) {
        setOrders(data.orders || []);
        setPages(data.pages || 1);
      } else if (res.status === 404) {
        // Likely backend deployment missing the new route
        setOrders([]);
        setPages(1);
        toast.error("Orders endpoint not found (deploy backend update?)");
      } else {
        toast.error((data && data.message) || "Failed to load orders");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error loading orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1, statusFilter);
    setPage(1);
  }, [statusFilter]);
  useEffect(() => {
    fetchOrders(page, statusFilter);
  }, [page]);

  // Status change handler removed

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders;
    const term = search.toLowerCase();
    return orders.filter(
      (o) =>
        o.orderId.toLowerCase().includes(term) ||
        (o.shippingAddress?.fullName || "").toLowerCase().includes(term) ||
        o.items.some((it) => it.productName.toLowerCase().includes(term))
    );
  }, [orders, search]);

  return (
    <AdminProtectedRoute>
      <div className="flex">
        <Slidebar />
        <div className="flex-1 p-8 bg-gray-50 min-h-screen">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Manage Orders 🧾
            </h1>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search order ID, customer, product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Statuses</option>
                {Object.keys(statusColors).map((s) => (
                  <option key={s} value={s}>
                    {readableStatus(s)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Unified row style list (replaces table) */}
          <div className="space-y-5">
            {loading ? (
              <div className="bg-white border rounded-xl p-6 text-center text-gray-400 text-sm">
                Loading orders...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white border rounded-xl p-6 text-center text-gray-500 text-sm">
                No orders found.
              </div>
            ) : (
              filteredOrders.map((o) => {
                const date = new Date(o.createdAt);
                const dateStr = date.toLocaleDateString();
                const timeStr = date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const expected = o.expectedDelivery
                  ? new Date(o.expectedDelivery)
                  : null;
                const expectedStr = expected
                  ? expected.toLocaleDateString()
                  : "—";
                const addr = o.shippingAddress || {};
                const isOpen = expanded.has(o._id);
                return (
                  <div
                    key={o._id}
                    className="group bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-4 px-5 pt-5">
                      <div className="flex items-center gap-2 text-sm font-mono text-indigo-600">
                        <FiHash className="text-indigo-400" />
                        <span className="font-semibold">{o.orderId}</span>
                      </div>
                      <span
                        className={`ml-auto px-3 py-1 rounded-full text-[11px] font-medium tracking-wide ${
                          statusColors[o.status] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {readableStatus(o.status)}
                      </span>
                    </div>
                    {/* Metrics */}
                    <div className="mt-4 px-5 flex flex-wrap gap-2 text-[11px]">
                      <div className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
                        <FiShoppingCart /> Qty: {o.totalQuantity}
                      </div>
                      <div className="flex items-center gap-1 bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full">
                        <FiPackage /> ₹{o.totalAmount.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">
                        <FiTruck />{" "}
                        {expectedStr === "—" ? "ETA —" : expectedStr}
                      </div>
                      <div className="flex items-center gap-1 bg-slate-50 text-slate-600 px-2.5 py-1 rounded-full">
                        <FiClock /> {dateStr} {timeStr}
                      </div>
                    </div>
                    {/* Body grid */}
                    <div className="mt-4 px-5 pb-4 grid sm:grid-cols-3 gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 font-semibold text-gray-700 text-[11px] uppercase tracking-wide">
                          <FiUser className="text-gray-400" /> Customer
                        </div>
                        <div className="text-gray-800 font-medium">
                          {o.shippingAddress?.fullName || "—"}
                        </div>
                        <div className="text-gray-500">
                          {addr.phoneNumber || "—"}
                        </div>
                        <div className="text-gray-500">
                          {o.paymentMethod || "—"} ({o.paymentStatus || "—"})
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 font-semibold text-gray-700 text-[11px] uppercase tracking-wide">
                          <FiMapPin className="text-gray-400" /> Shipping
                        </div>
                        <div className="text-gray-600 leading-snug">
                          {addr.address ? (
                            <>
                              {addr.address}
                              {addr.city && ", " + addr.city}
                              {addr.state && ", " + addr.state}
                              {addr.pincode && " - " + addr.pincode}
                              {addr.landmark && (
                                <span className="block text-gray-400">
                                  {addr.landmark}
                                </span>
                              )}
                            </>
                          ) : (
                            "—"
                          )}
                        </div>
                        <div className="text-gray-500 mt-1">
                          Subtotal: ₹
                          {o.subtotal?.toLocaleString?.() || o.subtotal}
                        </div>
                        {o.shippingCost !== undefined && (
                          <div className="text-gray-500">
                            Shipping: ₹
                            {o.shippingCost?.toLocaleString?.() ||
                              o.shippingCost}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 font-semibold text-gray-700 text-[11px] uppercase tracking-wide">
                            <FiPackage className="text-gray-400" /> Items (
                            {o.items.length})
                          </div>
                          <button
                            onClick={() => toggleExpand(o._id)}
                            className="text-[11px] px-2 py-1 rounded border border-gray-200 hover:border-indigo-400 hover:text-indigo-600 transition"
                          >
                            {isOpen ? "Hide" : "View"}
                          </button>
                        </div>
                        <div className="relative">
                          <div
                            className={`space-y-1 mt-1 ${
                              !isOpen ? "max-h-12 overflow-hidden" : ""
                            }`}
                          >
                            {o.items.map((it) => (
                              <div
                                key={it.productId}
                                className="flex justify-between gap-3 text-gray-600"
                              >
                                <span className="truncate flex-1">
                                  {it.productName}
                                </span>
                                <span className="text-gray-400">
                                  ×{it.quantity}
                                </span>
                                <span className="text-gray-500">
                                  ₹
                                  {(
                                    it.productPrice * it.quantity
                                  ).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                          {!isOpen && o.items.length > 2 && (
                            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center text-[10px] text-gray-400">
                              +{o.items.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {!loading && pages > 1 && (
              <div className="flex items-center justify-between text-sm px-1">
                <div className="text-gray-500">
                  Page {page} / {pages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 bg-white border rounded disabled:opacity-40 shadow-sm"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={page === pages}
                    className="px-3 py-1 bg-white border rounded disabled:opacity-40 shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* (Table removed) */}
        </div>
      </div>
    </AdminProtectedRoute>
  );
};

export default AdminOrders;
