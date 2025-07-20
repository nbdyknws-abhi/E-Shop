import React from "react";
import Slidebar from "./Slidebar";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect,useState } from "react";
import toast from "react-hot-toast";

const EditProducts = () => {
  const navigate = useNavigate();
  const [edit, setEdit] = useState({});

  const { id } = useParams();
  async function handleForm(e) {
    try {
      e.preventDefault();
      
      const formData={
        Pname:edit.ProductName,
        Pprice:edit.ProductPrice,
        Pcat:edit.ProductCat,
        Pstatus:edit.ProductStatus,
        Pimage:edit.ProductImage
      }
      console.log(formData);
      const response = await fetch(`/api/productupdate/${id}`,{
        method:"PUT",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(formData)
      })
      const result = await response.json();
      if(response.ok){
        toast.success(result.message);
        navigate("/admin/products");
      }else{
        toast.error(result.message);
      }
    } catch (error) {
      console.log(error);
      
    }
  }
  async function handleEdit() {
    try {
      const response = await fetch(`/api/fetchdata/${id}`);
      const result = await response.json();
      
      setEdit(result.data);
    } catch (error) {
      console.log(error);
      
    }
  }
  useEffect(() => {
    handleEdit(id);
  }, []);
  function handleChange(e) {
    setEdit({ ...edit, [e.target.name]: e.target.value });
    
  }
  return (
    <div className="flex mt-16">
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
        <form onSubmit={handleForm}
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
            value={edit.ProductName }
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
            value={edit.ProductPrice }
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
            value={edit.ProductCat }
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
            value={edit.ProductStatus }
            className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">---Select---</option>
            <option value="In-Stock">In-Stock</option>
            <option value="Out-Of-Stock">Out-Of-Stock</option>
          </select>

          <label htmlFor="" className="block text-gray-700 font-medium mb-1">
            Product Image
          </label>
          <input
            type="file"
            name=""
            id=""
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none "
          />
          <div className="text-right">
            <button className="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-700 transition">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProducts;
