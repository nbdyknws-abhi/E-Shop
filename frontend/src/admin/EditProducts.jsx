import React from "react";
import Slidebar from "./Slidebar";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const EditProducts = () => {
  const navigate = useNavigate();
  const [edit, setEdit] = useState({
    ProductName: "",
    ProductPrice: "",
    ProductCat: "",
    ProductStatus: "",
    ProductImage: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
  const [loading, setLoading] = useState(true);

  const { id } = useParams();
  async function handleForm(e) {
    try {
      e.preventDefault();

      const formData = new FormData();
      formData.append("Pname", edit.ProductName);
      formData.append("Pprice", edit.ProductPrice);
      formData.append("Pcat", edit.ProductCat);
      formData.append("Pstatus", edit.ProductStatus);

      const headers = new Headers();
      const token = localStorage.getItem("token");
      if (token) {
        headers.append("Authorization", `Bearer ${token}`);
      }

      // ✅ Only append a new image if user selected it
      if (selectedFile) {
        formData.append("ProductImage", selectedFile);
      }

      // If user wants to remove current image, send a flag
      if (removeCurrentImage && !selectedFile) {
        formData.append("removeImage", "true");
      }

      const response = await fetch(`/api/productupdate/${id}`, {
        method: "PUT",
        headers: headers,
        body: formData, // ✅ no JSON headers here
      });

      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
        navigate("/admin/products");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async function handleEdit() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = new Headers();
      if (token) {
        headers.append("Authorization", `Bearer ${token}`);
      }

      const response = await fetch(`/api/fetchdata/${id}`, {
        headers: headers,
      });
      const result = await response.json();

      if (response.ok) {
        setEdit(result.data);
      } else {
        toast.error("Failed to load product data");
        navigate("/admin/products");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error loading product data");
      navigate("/admin/products");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    handleEdit(id);
  }, []);
  function handleChange(e) {
    setEdit({ ...edit, [e.target.name]: e.target.value });
  }
  return (
    <div className="flex ">
      <Slidebar />
      <div className="flex-1 p-10 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Edit Product 📋
        </h1>
        <button
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          onClick={() => {
            navigate("/admin/products");
          }}
        >
          Back
        </button>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <span className="ml-3 text-gray-600">Loading product data...</span>
          </div>
        ) : (
          <form
            onSubmit={handleForm}
            action=""
            className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8 max-w-3xl mx-auto space-y-6"
          >
            <label htmlFor="" className="block text-gray-700 font-medium mb-1">
              Product Name
            </label>
            <input
              type="text"
              onChange={handleChange}
              name="ProductName"
              id=""
              value={edit.ProductName}
              placeholder="e.g Fresh Fruits"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <label htmlFor="" className="block text-gray-700 font-medium mb-1">
              Price ₹
            </label>
            <input
              type="number"
              onChange={handleChange}
              name="ProductPrice"
              id=""
              value={edit.ProductPrice}
              placeholder="e.g 999"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <label htmlFor="" className="block text-gray-700 font-medium mb-1">
              Categorys
            </label>
            <select
              onChange={handleChange}
              name="ProductCat"
              id=""
              value={edit.ProductCat}
              className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">---Select---</option>
              <option value="Cafe">Cafe</option>
              <option value="Home">Home</option>
              <option value="Toys">Toys</option>
              <option value="Fresh">Fresh</option>
              <option value="Electronics">Electronics</option>
              <option value="Mobile">Mobile</option>
              <option value="Beauty">Beauty</option>
            </select>

            <label htmlFor="" className="block text-gray-700 font-medium mb-1">
              Action
            </label>

            <select
              onChange={handleChange}
              name="ProductStatus"
              id=""
              value={edit.ProductStatus}
              className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">---Select---</option>
              <option value="In-Stock">In-Stock</option>
              <option value="Out-Of-Stock">Out-Of-Stock</option>
            </select>

            <label htmlFor="" className="block text-gray-700 font-medium mb-1">
              Product Image
            </label>

            {/* Show current image if it exists */}
            {edit.ProductImage && !selectedFile && !removeCurrentImage && (
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-2">Current Image:</p>
                <div className="flex items-start gap-3">
                  <img
                    src={`/uploads/${edit.ProductImage}`}
                    alt="Current product"
                    className="w-32 h-32 object-cover rounded border border-gray-300"
                    onError={(e) => {
                      e.target.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NSAxMDBMMTAwIDEyNUwxMTUgMTAwTDE0NSAxNDBINTVMODUgMTAwWiIgZmlsbD0iI0QxRDVEQiIvPgo8Y2lyY2xlIGN4PSI3NSIgY3k9IjY1IiByPSIxNSIgZmlsbD0iI0QxRDVEQiIvPgo8dGV4dCB4PSIxMDAiIHk9IjE3MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD4KPHN2Zz4K";
                      e.target.alt = "Image not available";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setRemoveCurrentImage(true)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                  >
                    Remove Image
                  </button>
                </div>
              </div>
            )}

            {/* Show message when image is marked for removal */}
            {removeCurrentImage && !selectedFile && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-600 text-sm">
                  Image will be removed when you save changes.
                </p>
                <button
                  type="button"
                  onClick={() => setRemoveCurrentImage(false)}
                  className="text-red-500 text-sm underline hover:no-underline"
                >
                  Keep current image
                </button>
              </div>
            )}

            {/* Show preview of new selected image */}
            {selectedFile && (
              <div className="mb-3">
                <p className="text-sm text-green-600 mb-2">
                  New Image Selected:
                </p>
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="New product preview"
                  className="w-32 h-32 object-cover rounded border border-green-300"
                />
              </div>
            )}

            <input
              type="file"
              name="ProductImage"
              id=""
              accept="image/*"
              onChange={(e) => {
                setSelectedFile(e.target.files[0]);
                setRemoveCurrentImage(false); // Reset remove flag when new file is selected
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none "
            />
            <p className="text-sm text-gray-500">
              {edit.ProductImage
                ? "Upload new image to replace current one, or leave empty to keep current image"
                : "Choose an image file"}
            </p>
            <div className="text-right">
              <button className="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-700 transition">
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditProducts;
