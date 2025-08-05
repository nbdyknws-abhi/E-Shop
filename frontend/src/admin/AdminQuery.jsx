import React from "react";
import Slidebar from "./Slidebar";
import { useEffect } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const AdminQuery = () => {
  const [queryData, setQueryData] = useState([]);
  async function handleReply() {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/query/reply", {
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

      const response = await fetch(`/api/deletequery/${id}`, {
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
      <div className="flex-1 p-10 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Query Management 📧
        </h1>

        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  S.No
                </th>
                <th scope="col" className="px-6 py-3">
                  User Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Query
                </th>
                <th scope="col" className="px-6 py-3">
                  Email-ID
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-6 py-3">
                  Action-1
                </th>
                <th scope="col" className="px-6 py-3">
                  Action-2
                </th>
              </tr>
            </thead>
            <tbody>
              {queryData && queryData.length > 0 ? (
                queryData.map((item, index) => (
                  <tr
                    key={item._id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200"
                  >
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">{item.Name}</td>
                    <td className="px-6 py-4">{item.Query}</td>
                    <td className="px-6 py-4">{item.Email}</td>
                    <td className="px-6 py-4">
                      <button className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        {item.QueryStatus === "Pending"
                          ? "Pending"
                          : "Resolved"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/admin/admin-reply/${item._id}`}>
                        <button className="text-xs bg-green-600 text-white px-3 py-1 rounded">
                          Reply
                        </button>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-xs bg-red-500 text-white px-3 py-1 rounded"
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
      </div>
    </div>
  );
};

export default AdminQuery;
