import React from "react";
import Slidebar from "./Slidebar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";

const AddProducts = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState({ Pname: "", Price: "", Cat: "" });
  const [pimage, setPimage] = useState("");

  async function handleForm(e) {
    e.preventDefault();
    const formdata = new FormData();
    formdata.append("Pname", product.Pname);
    formdata.append("Price", product.Price);
    formdata.append("Cat", product.Cat);
    formdata.append("pimage", pimage);

    try {
      const response = await fetch("/api/add-product", {
        method: "POST",
        body: formdata,
      });
      const result = await response.json();
      console.log(result);
      if (response.ok) {
        toast.success(result.message);
        navigate("/admin/products");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }
  function handleChange(e) {
    setProduct({ ...product, [e.target.name]: e.target.value });
  }
  return (
    <div className="flex mt-16">
      <Slidebar />
      <div className="flex-1 p-10 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Add Products 💹
        </h1>
        <button
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          onClick={() => {
            navigate("/admin/products");
          }}
        >
          Back
        </button>
        <form
          onSubmit={handleForm}
          encType="multipart/form-data"
          action=""
          className="bg-white shadow-md rounded-xl p-6 max-w-3xl mx-auto space-y-6"
        >
          <label htmlFor="" className="block text-gray-700 font-medium mb-1">
            Product Name
          </label>
          <input
            type="text"
            name="Pname"
            id=""
            value={product.Pname}
            onChange={handleChange}
            placeholder="e.g Fresh Fruits"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <label htmlFor="" className="block text-gray-700 font-medium mb-1">
            Price ₹
          </label>
          <input
            type="number"
            name="Price"
            id=""
            value={product.Price}
            onChange={handleChange}
            placeholder="e.g 999"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <label htmlFor="" className="block text-gray-700 font-medium mb-1">
            Categories
          </label>
          <select
            name="Cat"
            id=""
            value={product.Cat}
            onChange={handleChange}
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
            Product Image
          </label>
          <input
            type="file"
            name="pimage"
            id=""
            onChange={(e) => setPimage(e.target.files[0])}
            accept="image/*"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none "
          />
          <div className="text-right">
            <button
              type="submit"
              className="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProducts;
