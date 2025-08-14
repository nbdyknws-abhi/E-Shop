import React from "react";
import Slidebar from "./Slidebar";
import { useEffect } from "react";
import { useState } from "react";
import { API_BASE } from "../utils/api";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const AdminQuery = () => {
  const [queryData, setQueryData] = useState([]);
  async function handleReply() {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/query/reply`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const record = await response.json();

      if (response.ok) {
        setQueryData(record.data || []);
      } else {
        toast.error(record.message || "Failed to fetch queries");
        setQueryData([]);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error fetching queries");
      setQueryData([]);
    }
  }
  async function handleDelete(id) {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/deletequery/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        setQueryData(queryData.filter((item) => item._id !== id));
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      console.log(result);
    } catch (error) {
      toast.error(error.message);
    }
  }
  useEffect(() => {
    handleReply();
  }, []);
  return (
    <div className="flex ">
      <Slidebar />
      <div className="flex-1 px-4 sm:px-6 lg:px-10 py-8 bg-gray-50 min-h-screen">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
          Query Management 📧
        </h1>

        {/* Desktop / large-table view */}
        <div className="relative overflow-x-auto hidden md:block rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th scope="col" className="px-5 py-3">
                  S.No
                </th>
                <th scope="col" className="px-5 py-3">
                  User Name
                </th>
                <th scope="col" className="px-5 py-3 w-1/3">
                  Query
                </th>
                <th scope="col" className="px-5 py-3">
                  Email
                </th>
                <th scope="col" className="px-5 py-3">
                  Status
                </th>
                <th scope="col" className="px-5 py-3">
                  Reply
                </th>
                <th scope="col" className="px-5 py-3">
                  Delete
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {queryData && queryData.length > 0 ? (
                queryData.map((item, index) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-xs font-mono text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-800 whitespace-nowrap">
                      {item.Name}
                    </td>
                    <td className="px-5 py-4 text-gray-600 break-words whitespace-pre-line">
                      {item.Query}
                    </td>
                    <td className="px-5 py-4 text-gray-500">{item.Email}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          item.QueryStatus === "Pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {item.QueryStatus === "Pending"
                          ? "Pending"
                          : "Resolved"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Link to={`/admin/admin-reply/${item._id}`}>
                        <button className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded transition">
                          Reply
                        </button>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="text-4xl mb-4">📧</div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      No queries found
                    </h3>
                    <p className="text-gray-500">
                      Customer queries will appear here
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile / card view */}
        <div className="md:hidden space-y-4">
          {queryData && queryData.length > 0 ? (
            queryData.map((item, index) => (
              <div
                key={item._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-400">#{index + 1}</p>
                    <h3 className="text-base font-semibold text-gray-800">
                      {item.Name}
                    </h3>
                    <p className="text-xs text-indigo-500 break-all">
                      {item.Email}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-1 rounded-full font-semibold tracking-wide ${
                      item.QueryStatus === "Pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {item.QueryStatus === "Pending" ? "Pending" : "Resolved"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-line break-words">
                  {item.Query}
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <Link
                    to={`/admin/admin-reply/${item._id}`}
                    className="flex-1"
                  >
                    <button className="w-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-md transition">
                      Reply
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-xs bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
              <div className="text-5xl mb-4">📧</div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No queries found
              </h3>
              <p className="text-gray-500 text-sm">
                Customer queries will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminQuery;
