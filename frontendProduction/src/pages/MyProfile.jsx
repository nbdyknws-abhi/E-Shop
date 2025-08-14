import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEdit,
  FaSave,
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBox,
  FaSignOutAlt,
} from "react-icons/fa";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import MyOrders from "../components/MyOrders";
import { API_BASE, authHeaders } from "../utils/api";

const MyProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    userName: "",
    userEmail: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    dateJoined: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userId = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!token || !userId) {
        toast.error("Please login to view your profile");
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/user/profile/${userId}`, {
          headers: { ...authHeaders() },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Profile data:", data);

          // Set profile data with fallbacks
          setProfileData({
            userName:
              data.user?.userName || localStorage.getItem("userName") || "",
            userEmail: data.user?.userEmail || "",
            phoneNumber: data.user?.phoneNumber || "",
            address: data.user?.address || "",
            city: data.user?.city || "",
            state: data.user?.state || "",
            pincode: data.user?.pincode || "",
            dateJoined: data.user?.createdAt || data.user?.dateJoined || "",
          });

          setEditedData(profileData);
        } else {
          // If profile endpoint doesn't exist, use basic data from localStorage
          const basicProfile = {
            userName: localStorage.getItem("userName") || "",
            userEmail: "",
            phoneNumber: "",
            address: "",
            city: "",
            state: "",
            pincode: "",
            dateJoined: "",
          };
          setProfileData(basicProfile);
          setEditedData(basicProfile);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Use fallback data from localStorage
        const basicProfile = {
          userName: localStorage.getItem("userName") || "",
          userEmail: "",
          phoneNumber: "",
          address: "",
          city: "",
          state: "",
          pincode: "",
          dateJoined: "",
        };
        setProfileData(basicProfile);
        setEditedData(basicProfile);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleEdit = () => {
    setEditedData({ ...profileData });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedData({ ...profileData });
    setIsEditing(false);
  };

  const handleSave = async () => {
    const userId = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !userId) {
      toast.error("Please login to update profile");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_BASE}/user/profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(editedData),
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData({ ...editedData });

        // Update localStorage with new username if changed
        if (editedData.userName) {
          localStorage.setItem("userName", editedData.userName);
        }

        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userName");
    toast.success("Logged out successfully!");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <LoadingSpinner size="large" message="Loading your profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
              <p className="text-gray-600 mt-2">
                Manage your account and view your orders
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 md:mt-0 flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-6 py-4 font-medium flex items-center gap-2 ${
                activeTab === "profile"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <FaUser />
              Personal Details
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-6 py-4 font-medium flex items-center gap-2 ${
                activeTab === "orders"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <FaBox />
              My Orders
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Personal Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <FaEdit />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      <FaSave />
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <FaTimes />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800 mb-3">
                    Basic Information
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaUser className="inline mr-2" />
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.userName || ""}
                        onChange={(e) =>
                          handleInputChange("userName", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">
                        {profileData.userName || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaEnvelope className="inline mr-2" />
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedData.userEmail || ""}
                        onChange={(e) =>
                          handleInputChange("userEmail", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter your email"
                      />
                    ) : (
                      <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">
                        {profileData.userEmail || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaPhone className="inline mr-2" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedData.phoneNumber || ""}
                        onChange={(e) =>
                          handleInputChange("phoneNumber", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">
                        {profileData.phoneNumber || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800 mb-3">
                    <FaMapMarkerAlt className="inline mr-2" />
                    Address Information
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editedData.address || ""}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter your address"
                      />
                    ) : (
                      <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">
                        {profileData.address || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData.city || ""}
                          onChange={(e) =>
                            handleInputChange("city", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="City"
                        />
                      ) : (
                        <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">
                          {profileData.city || "Not provided"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData.state || ""}
                          onChange={(e) =>
                            handleInputChange("state", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="State"
                        />
                      ) : (
                        <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">
                          {profileData.state || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PIN Code
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.pincode || ""}
                        onChange={(e) =>
                          handleInputChange("pincode", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="PIN Code"
                      />
                    ) : (
                      <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">
                        {profileData.pincode || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-800 mb-3">
                  Account Information
                </h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Member since:</strong>{" "}
                    {formatDate(profileData.dateJoined)}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    <strong>User ID:</strong>{" "}
                    {localStorage.getItem("user")?.slice(-8) || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="bg-white rounded-lg shadow-sm">
            <MyOrders embedded={true} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
