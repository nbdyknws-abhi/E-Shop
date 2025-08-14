import React from "react";
import Slidebar from "./Slidebar";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { API_BASE } from "../utils/api";

const AdminReply = () => {
  const [reply, setReply] = useState({ to: "", sub: "", body: "" });
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  async function getQuery() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Authentication required. Please login again.");
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE}/getquery/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        setReply((prevReply) => ({
          ...prevReply,
          to: result.data.Email || "",
        }));
        console.log("Query data fetched:", result.data);
      } else {
        if (response.status === 401 || response.status === 403) {
          toast.error("Authentication failed. Please login again.");
          navigate("/login");
        } else {
          toast.error(result.message || "Failed to fetch query details");
        }
        console.error(result.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error fetching query details");
    } finally {
      setLoading(false);
    }
  }
  async function handleForm(e) {
    try {
      e.preventDefault();
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Authentication required. Please login again.");
        navigate("/login");
        return;
      }

      if (!reply.to || !reply.sub || !reply.body) {
        toast.error("Please fill in all fields");
        return;
      }

      const response = await fetch(`${API_BASE}/queryreply/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reply),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);
        console.log(result);
        navigate("/admin/admin-query");
      } else {
        if (response.status === 401 || response.status === 403) {
          toast.error("Authentication failed. Please login again.");
          navigate("/login");
        } else {
          toast.error(result.message);
        }
        console.error(result.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error sending reply");
    }
  }
  function handleChange(e) {
    setReply({ ...reply, [e.target.name]: e.target.value });
  }
  useEffect(() => {
    if (id) {
      getQuery();
    }
  }, [id]);
  return (
    <div className="flex mt-16">
      <Slidebar />
      <div className="flex-1 p-10 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Query Management 📊
        </h1>
        <button
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          onClick={() => {
            navigate("/admin/admin-query");
          }}
        >
          Back
        </button>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600">
              Loading query details...
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleForm}
            action=""
            className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8 max-w-3xl mx-auto space-y-6"
          >
            <label htmlFor="" className="block text-gray-700 font-medium mb-1">
              To
            </label>
            <input
              type="text"
              name="to"
              id="to"
              value={reply.to}
              onChange={handleChange}
              placeholder="Write Sender's Email"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <label htmlFor="" className="block text-gray-700 font-medium mb-1">
              From
            </label>
            <input
              type="email"
              name=""
              id=""
              value={"mondaynomonday001@gmail.com"}
              placeholder="Write Your Email"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <label htmlFor="" className="block text-gray-700 font-medium mb-1">
              Subject
            </label>
            <input
              type="text"
              onChange={handleChange}
              name="sub"
              id=""
              value={reply.sub}
              placeholder="Write the Subject"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <label htmlFor="" className="block text-gray-700 font-medium mb-1">
              Body
            </label>
            <textarea
              name="body"
              id="body"
              onChange={handleChange}
              rows="5"
              value={reply.body}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            ></textarea>

            <div className="text-right">
              <button className="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-700 transition">
                Send Reply
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminReply;
