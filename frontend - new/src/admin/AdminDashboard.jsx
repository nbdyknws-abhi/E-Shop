import React, { useState, useEffect, useMemo } from "react";
import Slidebar from "./Slidebar";
import { makeAdminRequest } from "../utils/authUtils";
import toast from "react-hot-toast";
import AdminProtectedRoute from "./AdminProtectedRoute";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    daily: [],
  });
  const [rangePreset, setRangePreset] = useState("all"); // presets: 7d,30d,90d,6m,1y,all,custom
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const [ordersLoading, setOrdersLoading] = useState(true);

  async function getProducts() {
    try {
      const response = await makeAdminRequest("/getproducts");

      if (response.ok) {
        const result = await response.json();
        setProducts(result.data);
      } else {
        toast.error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Error loading dashboard data");
    } finally {
      setLoading(false);
    }
  }

  async function getOrderStats() {
    try {
      const res = await makeAdminRequest("/orders-stats");
      const contentType = res.headers.get("content-type") || "";
      let data = null;
      if (contentType.includes("application/json")) {
        try {
          data = await res.json();
        } catch (e) {
          console.warn("Failed to parse order stats JSON", e);
        }
      }
      if (res.ok && data) {
        setOrderStats(data);
      } else if (res.status === 404) {
        toast.error("Stats endpoint not found (deploy backend update?)");
      } else {
        toast.error((data && data.message) || "Failed to fetch order stats");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error loading order stats");
    } finally {
      setOrdersLoading(false);
    }
  }

  useEffect(() => {
    getProducts();
    getOrderStats();
  }, []);

  // Filtered data based on selected range
  const filteredDaily = useMemo(() => {
    if (!orderStats.daily || orderStats.daily.length === 0) return [];
    if (rangePreset === "all") return orderStats.daily;

    let fromDate = null;
    let toDate = null;

    if (rangePreset === "custom") {
      if (customFrom) fromDate = new Date(customFrom);
      if (customTo) toDate = new Date(customTo);
      // If only one bound picked, default the other
      if (!fromDate && toDate) {
        // earliest date in dataset
        fromDate = new Date(orderStats.daily[0].date);
      }
      if (fromDate && !toDate) {
        toDate = new Date();
      }
      if (fromDate && toDate && fromDate > toDate)
        [fromDate, toDate] = [toDate, fromDate];
    } else {
      const now = new Date();
      toDate = now;
      switch (rangePreset) {
        case "7d":
          fromDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          fromDate = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
          break;
        case "90d":
          fromDate = new Date(now.getTime() - 89 * 24 * 60 * 60 * 1000);
          break;
        case "6m": {
          fromDate = new Date(now);
          fromDate.setMonth(fromDate.getMonth() - 6);
          break;
        }
        case "1y": {
          fromDate = new Date(now);
          fromDate.setFullYear(fromDate.getFullYear() - 1);
          break;
        }
        default:
          fromDate = new Date(orderStats.daily[0].date);
      }
    }
    if (!fromDate || !toDate) return orderStats.daily; // fallback

    const fromStr = fromDate.toISOString().slice(0, 10);
    const toStr = toDate.toISOString().slice(0, 10);
    return orderStats.daily.filter((d) => d.date >= fromStr && d.date <= toStr);
  }, [orderStats.daily, rangePreset, customFrom, customTo]);

  // Recompute summary for filtered window
  const windowTotals = useMemo(() => {
    const totalOrders = filteredDaily.reduce((a, d) => a + d.count, 0);
    const totalRevenue = filteredDaily.reduce((a, d) => a + d.revenue, 0);
    return { totalOrders, totalRevenue };
  }, [filteredDaily]);

  return (
    <AdminProtectedRoute>
      <div className="flex">
        <Slidebar />
        <div className="flex-1 p-10 bg-gray-50 min-h-screen">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            Admin Dashboard 📊
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-sm font-medium text-gray-500 tracking-wide uppercase">
                Total Products
              </h2>
              {loading ? (
                <p className="text-lg mt-3 text-gray-400">Loading...</p>
              ) : (
                <p className="text-4xl mt-2 font-bold text-emerald-600">
                  {products.length}
                </p>
              )}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-sm font-medium text-gray-500 tracking-wide uppercase">
                Total Orders
              </h2>
              {ordersLoading ? (
                <p className="text-lg mt-3 text-gray-400">Loading...</p>
              ) : (
                <div className="mt-2">
                  <p className="text-4xl font-bold text-indigo-600 leading-none">
                    {rangePreset === "all"
                      ? orderStats.totalOrders
                      : windowTotals.totalOrders}
                  </p>
                  {rangePreset !== "all" && (
                    <p className="text-[11px] mt-1 text-gray-400 tracking-wide">
                      of {orderStats.totalOrders} total
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-sm font-medium text-gray-500 tracking-wide uppercase">
                Total Revenue
              </h2>
              {ordersLoading ? (
                <p className="text-lg mt-3 text-gray-400">Loading...</p>
              ) : (
                <div className="mt-2">
                  <p className="text-4xl font-bold text-rose-600 leading-none">
                    ₹
                    {(rangePreset === "all"
                      ? orderStats.totalRevenue
                      : windowTotals.totalRevenue
                    ).toLocaleString()}
                  </p>
                  {rangePreset !== "all" && (
                    <p className="text-[11px] mt-1 text-gray-400 tracking-wide">
                      of ₹{orderStats.totalRevenue.toLocaleString()} total
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                📈 Orders Over Time
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                <div className="flex flex-wrap gap-2">
                  {[
                    { k: "7d", label: "7D" },
                    { k: "30d", label: "30D" },
                    { k: "90d", label: "90D" },
                    { k: "6m", label: "6M" },
                    { k: "1y", label: "1Y" },
                    { k: "all", label: "ALL" },
                    { k: "custom", label: "Custom" },
                  ].map((p) => (
                    <button
                      key={p.k}
                      onClick={() => setRangePreset(p.k)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium tracking-wide border transition shadow-sm ${
                        rangePreset === p.k
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white hover:bg-indigo-50 text-gray-600 border-gray-300"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                {rangePreset === "custom" && (
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className="border rounded px-2 py-1 text-xs"
                      max={customTo || undefined}
                    />
                    <span className="text-gray-400 text-xs">to</span>
                    <input
                      type="date"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                      className="border rounded px-2 py-1 text-xs"
                      min={customFrom || undefined}
                    />
                  </div>
                )}
              </div>
            </div>
            {!ordersLoading && (
              <div className="flex flex-wrap gap-4 mb-4 text-xs text-gray-500">
                <div>
                  Window Orders:{" "}
                  <span className="font-semibold text-indigo-600">
                    {windowTotals.totalOrders}
                  </span>
                </div>
                <div>
                  Window Revenue:{" "}
                  <span className="font-semibold text-rose-600">
                    ₹{windowTotals.totalRevenue.toLocaleString()}
                  </span>
                </div>
                {rangePreset === "custom" && customFrom && customTo && (
                  <div className="text-gray-400">
                    {customFrom} → {customTo}
                  </div>
                )}
              </div>
            )}
            {ordersLoading ? (
              <p className="text-gray-400">Loading chart...</p>
            ) : filteredDaily.length === 0 ? (
              <p className="text-gray-500">No orders yet.</p>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={filteredDaily}
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorOrders"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#6366f1"
                          stopOpacity={0.6}
                        />
                        <stop
                          offset="95%"
                          stopColor="#6366f1"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#ec4899"
                          stopOpacity={0.6}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ec4899"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      stroke="#94a3b8"
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 12 }}
                      stroke="#94a3b8"
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 12 }}
                      stroke="#94a3b8"
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        borderColor: "#e5e7eb",
                      }}
                      formatter={(value, name) => {
                        if (name === "revenue")
                          return ["₹" + value.toLocaleString(), "Revenue"];
                        return [value, "Orders"];
                      }}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      name="orders"
                      dataKey="count"
                      stroke="#6366f1"
                      fillOpacity={1}
                      fill="url(#colorOrders)"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      name="revenue"
                      dataKey="revenue"
                      stroke="#ec4899"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  );
};

export default AdminDashboard;
