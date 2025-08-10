import React from "react";
import Slidebar from "./Slidebar";
import { useState, useEffect,useRef } from "react";
import { makeAdminRequest } from "../utils/authUtils";
import toast from "react-hot-toast";
import AdminProtectedRoute from "./AdminProtectedRoute";
import { FaMapMarkerAlt, FaPhone, FaUser } from "react-icons/fa";
import { ASSETS_BASE } from "../utils/api";

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersRangeTotal, setOrdersRangeTotal] = useState(0);
  const [orderSeries, setOrderSeries] = useState([]);
  const [granularity, setGranularity] = useState("day");
  const [range, setRange] = useState("14d"); // '14d' | '30d' | 'month' | 'year'
  const [statsLoading, setStatsLoading] = useState(true);
  const [ordersList, setOrdersList] = useState([]);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalCount, setOrdersTotalCount] = useState(0);
  const [ordersPageSize, setOrdersPageSize] = useState(20);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const ordersSectionRef = useRef(null);

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
  async function getOrdersStats({ range: r = range, days = 14 } = {}) {
    try {
      let url = "/admin/orders-stats";
      if (r === "14d") url += `?days=${days}`;
      else url += `?range=${r}`;
      const response = await makeAdminRequest(url);
      if (response.ok) {
        const result = await response.json();
        setOrdersTotal(result.totalOrders || 0);
        setOrdersRangeTotal(result.rangeTotal || 0);
        setOrderSeries(result.series || []);
        setGranularity(result.granularity || "day");
      } else {
        toast.error("Failed to fetch order stats");
      }
    } catch (error) {
      console.error("Error fetching orders stats:", error);
      toast.error("Error loading order stats");
    } finally {
      setStatsLoading(false);
    }
  }
  
  async function fetchAllOrders(page = ordersPage, limit = ordersPageSize) {
    try {
      setOrdersLoading(true);
      const resp = await makeAdminRequest(`/admin/orders?page=${page}&limit=${limit}`);
      if (resp.ok) {
        const json = await resp.json();
        setOrdersList(json.orders || []);
        setOrdersTotalCount(json.total || 0);
        setOrdersPage(json.page || page);
        setOrdersPageSize(json.limit || limit);
      } else {
        toast.error("Failed to load orders");
      }
    } catch (e) {
      console.error("Error loading orders:", e);
      toast.error("Error loading orders list");
    } finally {
      setOrdersLoading(false);
    }
  }
  
  useEffect(() => {
    getProducts();
    getOrdersStats({ range: "14d", days: 14 });
    fetchAllOrders(1, ordersPageSize);
  }, []);

    const maxCount = orderSeries.length ? Math.max(...orderSeries.map((d) => d.count)) : 0;
    const chartHeight = 200; // px
    const barWidth = 20; // px 
    const barGap = 12; // px

  
  return (
    <AdminProtectedRoute>
      <div className="flex">
        <Slidebar />
        <div className="flex-1 p-10 bg-gray-50 min-h-screen">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            Admin Dashboard 📊
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-semibold text-gray-700">Total Products</h2>
              {loading ? (
                <p className="text-lg mt-3 text-gray-500">Loading...</p>
              ) : (
                 <p className="text-3xl mt-3 font-bold text-green-700">{products.length}</p>
              )}
            </div>
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-semibold text-gray-700">Total Orders</h2>
              {statsLoading ? (
                <p className="text-lg mt-3 text-gray-500">Loading...</p>
              ) : (
                <p className="text-3xl mt-3 font-bold text-blue-700">{ordersTotal}</p>
              )}
            </div>
          <div className="bg-white p-6 rounded shadow hover:bg-indigo-400">
              
              <button
                type="button"
                onClick={() => ordersSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="mt-4 inline-flex items-center justify-center px-11  rounded text-xl font-semibold text-gray-700  focus:outline-none  "
              >
                Orders Received
              </button>
            </div>
          </div>

          <div className="mt-8 bg-white p-6 rounded shadow">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-semibold text-gray-700">Orders Trend</h2>
              <div className="flex items-center gap-2">
                <label htmlFor="range" className="text-sm text-gray-600">Range:</label>
                <select
                  id="range"
                  className="border rounded px-2 py-1 text-sm"
                  value={range}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRange(val);
                    setStatsLoading(true);
                    if (val === "14d") getOrdersStats({ range: "14d", days: 14 });
                    else getOrdersStats({ range: val });
                  }}
                >
                  <option value="14d">Last 14 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="month">This month</option>
                  <option value="year">Last year</option>
                </select>
              </div>
            </div>
            {statsLoading ? (
              <p className="text-lg mt-3 text-gray-500">Loading chart...</p>
            ) : orderSeries.length === 0 ? (
              <p className="text-gray-500 mt-4">No orders in the selected period.</p>
            ) : (
              <div className="mt-4">
                {/* Responsive bar chart using SVG */}
                <div className="w-full overflow-x-auto">
                  <svg
                    role="img"
                    aria-label="Orders per day"
                    className="min-w-[640px] w-full h-auto"
                    viewBox={`0 0 ${orderSeries.length * (barWidth + barGap) + 40} ${chartHeight + 60}`}
                  >
                    {/* Axes */}
                    <line x1="30" y1="10" x2="30" y2={chartHeight + 10} stroke="#e5e7eb" />
                    <line x1="30" y1={chartHeight + 10} x2={orderSeries.length * (barWidth + barGap) + 30} y2={chartHeight + 10} stroke="#e5e7eb" />

                    {/* Y-axis labels (0, max) */}
                    <text x="0" y={chartHeight + 15} fill="#6b7280" fontSize="10">0</text>
                    <text x="0" y="20" fill="#6b7280" fontSize="10">{maxCount}</text>

                    {/* Bars and X labels */}
                    {orderSeries.map((d, i) => {
                      const x = 30 + i * (barWidth + barGap);
                      const h = maxCount === 0 ? 0 : Math.round((d.count / maxCount) * chartHeight);
                      const y = chartHeight + 10 - h;
                      const dateLabel = granularity === 'month'
                        ? (() => {
                            // d.date is YYYY-MM
                            const [yy, mm] = d.date.split('-').map(Number);
                            const dt = new Date(Date.UTC(yy, (mm - 1), 1));
                            return dt.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
                          })()
                        : new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                      return (
                        <g key={d.date}>
                          <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={h}
                            fill="#3b82f6"
                            rx="4"
                          >
                          </rect>
                          <title>{`${dateLabel}: ${d.count} order${d.count !== 1 ? 's' : ''}`}</title>
                          <text
                            x={x + barWidth / 2}
                            y={chartHeight + 30}
                            textAnchor="middle"
                            fill="#6b7280"
                            fontSize="10"
                          >
                            {dateLabel}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Orders Received List */}
          <div ref={ordersSectionRef} className="mt-8 bg-white p-6 rounded shadow">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Orders Received</h2>
              <div className="flex items-center gap-2">
                <label htmlFor="pageSize" className="text-sm text-gray-600">Page size:</label>
                <select
                  id="pageSize"
                  className="border rounded px-2 py-1 text-sm"
                  value={ordersPageSize}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setOrdersPageSize(val);
                    fetchAllOrders(1, val);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
            {ordersLoading ? (
              <p className="text-gray-500">Loading orders...</p>
            ) : ordersList.length === 0 ? (
              <p className="text-gray-500">No orders found.</p>
            ) : (
              <div className="space-y-6">
                {ordersList.map((order) => (
                  <div key={order._id} className="border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <p className="text-sm text-gray-500">Order ID</p>
                        <p className="font-semibold">{order.orderId}</p>
                        <p className="text-xs text-gray-500">Placed: {new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-lg font-bold text-green-700">₹{(order.totalAmount || order.amount || 0).toFixed(2)}</p>
                        <p className="text-xs text-gray-500">Items: {order.totalQuantity || (order.items?.reduce((s,i)=>s + (i.quantity||0),0)) || 0}</p>
                      </div>
                    </div>
                    {/* Customer Info */}
                    <div className="mt-4 grid md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-sm font-medium mb-1">Customer</p>
                        <p className="flex items-center gap-2 text-gray-700"><FaUser className="text-gray-500" />{order.userId?.userName || 'N/A'}</p>
                        <p className="text-xs text-gray-600">{order.userId?.userEmail || 'N/A'}</p>
                        {order.userId?.phoneNumber && (
                          <p className="flex items-center gap-2 text-xs text-gray-700 mt-1"><FaPhone className="text-gray-500" />{order.userId.phoneNumber}</p>
                        )}
                      </div>
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-sm font-medium mb-1">Shipping Address</p>
                        {order.shippingAddress ? (
                          <div className="text-sm text-gray-700">
                            <p className="flex items-center gap-2"><FaMapMarkerAlt className="text-gray-500" />{order.shippingAddress.fullName || order.userId?.userName || 'N/A'}</p>
                            <p className="mt-1">{order.shippingAddress.address || 'N/A'}</p>
                            <p className="text-xs text-gray-600">{order.shippingAddress.city || 'N/A'}, {order.shippingAddress.state || 'N/A'} - {order.shippingAddress.pincode || 'N/A'}</p>
                            {order.shippingAddress.phoneNumber && (
                              <p className="text-xs">📞 {order.shippingAddress.phoneNumber}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600">N/A</p>
                        )}
                      </div>
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-sm font-medium mb-1">Payment</p>
                        <p className="text-sm">Method: {order.paymentMethod || 'Razorpay'}</p>
                        <p className="text-sm">Status: {order.paymentStatus || 'completed'}</p>
                        <p className="text-xs text-gray-600 break-all">Payment ID: {order.paymentId}</p>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Items</p>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="text-left text-gray-600">
                              <th className="py-2 pr-4">Product</th>
                              <th className="py-2 pr-4">Price</th>
                              <th className="py-2 pr-4">Qty</th>
                              <th className="py-2 pr-4">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items?.map((it, idx) => (
                              <tr key={idx} className="border-t">
                                <td className="py-2 pr-4">
                                  <div className="flex items-center gap-2">
                                    {it.productImage && (
                                      <img src={`${ASSETS_BASE}/uploads/${it.ProductImage}`} alt={it.productName} className="w-10 h-10 object-contain rounded" />
                                    )}
                                    <span className="max-w-[320px] line-clamp-2">{it.productName}</span>
                                  </div>
                                </td>
                                <td className="py-2 pr-4">₹{(it.productPrice || 0).toFixed(2)}</td>
                                <td className="py-2 pr-4">{it.quantity}</td>
                                <td className="py-2 pr-4 font-medium">₹{(((it.totalPrice ?? (it.productPrice * it.quantity)) || 0)).toFixed(2)}</td>
                              </tr>
                            ))}
                            {(!order.items || order.items.length === 0) && (
                              <tr>
                                <td className="py-2 pr-4" colSpan="4">No item details available</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Pagination */}
            {ordersTotalCount > ordersPageSize && (
              <div className="mt-6 flex items-center justify-between">
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  disabled={ordersPage <= 1}
                  onClick={() => fetchAllOrders(ordersPage - 1, ordersPageSize)}
                >
                  Previous
                </button>
                <p className="text-sm text-gray-600">
                  Page {ordersPage} of {Math.ceil(ordersTotalCount / ordersPageSize)} ({ordersTotalCount} orders)
                </p>
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  disabled={ordersPage >= Math.ceil(ordersTotalCount / ordersPageSize)}
                  onClick={() => fetchAllOrders(ordersPage + 1, ordersPageSize)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  );
};

export default AdminDashboard;


