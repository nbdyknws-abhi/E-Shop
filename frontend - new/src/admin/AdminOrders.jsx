import React, { useEffect, useState, useMemo } from "react";
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

  const fetchOrders = async (pageArg = page, statusArg = statusFilter) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: pageArg, limit });
      if (statusArg) qs.append("status", statusArg);
      const res = await makeAdminRequest(`/orders?${qs.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
        setPages(data.pages || 1);
      } else {
        toast.error(data.message || "Failed to load orders");
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

          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
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
                return (
                  <div
                    key={o._id}
                    className="bg-white border rounded-xl p-4 shadow-sm flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-mono text-xs text-gray-500">
                          #{o.orderId}
                        </div>
                        <div className="font-medium text-gray-800 text-sm">
                          {o.shippingAddress?.fullName || "—"}
                        </div>
                      </div>
                      <span
                        className={`shrink-0 px-2 py-1 rounded-full text-[10px] font-medium ${
                          statusColors[o.status] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {readableStatus(o.status)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      {o.items.slice(0, 2).map((it) => (
                        <div key={it.productId} className="truncate">
                          {it.productName} × {it.quantity}
                        </div>
                      ))}
                      {o.items.length > 2 && (
                        <div className="text-[10px] text-gray-400">
                          +{o.items.length - 2} more items
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 border-t pt-2">
                      <div>
                        <span className="font-semibold text-gray-700">
                          Qty:
                        </span>{" "}
                        {o.totalQuantity}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">
                          Amount:
                        </span>{" "}
                        ₹{o.totalAmount.toLocaleString()}
                      </div>
                      <div className="ml-auto text-right">
                        <div>{dateStr}</div>
                        <div>{timeStr}</div>
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

          {/* Desktop table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Order</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Items</th>
                    <th className="px-4 py-3 text-left">Qty</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Placed</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-4 py-10 text-center text-gray-400"
                      >
                        Loading orders...
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-4 py-10 text-center text-gray-500"
                      >
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => {
                      const date = new Date(o.createdAt);
                      const dateStr = date.toLocaleDateString();
                      const timeStr = date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      return (
                        <tr
                          key={o._id}
                          className="border-t hover:bg-gray-50 transition"
                        >
                          <td className="px-4 py-3 font-mono text-xs">
                            #{o.orderId}
                          </td>
                          <td className="px-4 py-3">
                            {o.shippingAddress?.fullName || "—"}
                          </td>
                          <td className="px-4 py-3 max-w-xs">
                            <div className="space-y-1">
                              {o.items.slice(0, 3).map((it) => (
                                <div key={it.productId} className="truncate">
                                  {it.productName} × {it.quantity}
                                </div>
                              ))}
                              {o.items.length > 3 && (
                                <div className="text-xs text-gray-400">
                                  +{o.items.length - 3} more
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">{o.totalQuantity}</td>
                          <td className="px-4 py-3 font-semibold">
                            ₹{o.totalAmount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide ${
                                statusColors[o.status] ||
                                "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {readableStatus(o.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {dateStr}
                            <br />
                            {timeStr}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {!loading && pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50 text-sm">
                <div className="text-gray-500">
                  Page {page} of {pages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 bg-white border rounded disabled:opacity-40 hover:bg-gray-100"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={page === pages}
                    className="px-3 py-1.5 bg-white border rounded disabled:opacity-40 hover:bg-gray-100"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  );
};

export default AdminOrders;
