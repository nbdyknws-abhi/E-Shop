import React from "react";
import Category from "./Category";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../features/cartSlice/cartSlice";
import { FaBoltLightning, FaCartPlus } from "react-icons/fa6";
import { BsQrCodeScan } from "react-icons/bs";

const Products = () => {
  const [data, setData] = useState([]);
  const [category, setCategory] = useState("All");

  const dispatch = useDispatch();
  async function Productsdata(SelectCategory="All") {
    try {
      const response = await fetch(`/api/allproducts?category=${SelectCategory}`, );
      const result = await response.json();
      if (response.ok) {
        setData(result.data);
        console.log(result.data);
      } else {
        console.error("Failed to fetch products:", result.message);
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    Productsdata(category);
  }, [category]);

  return (
    <section className="py-10 px-6 max-w-7xl mx-auto ">
      <Category onSelectCategory={setCategory} />
      <h2 className="text-2xl font-semibold text-gray-600 mb-6">
        {category} Products 
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-7">
        {data.map((item) => (
          <div
            key={item._id}
            className="bg-gradient-to-r from-slate-700 to-neutral-900 shadow rounded-lg p-4 hover:shadow-lg transition"
          >
            <img
              src={`/uploads/${item.ProductImage}`}
              alt="ProductImage"
              className="w-full h-32 object-contain rounded "
            />
            <h3 className="mt-2 font-medium text-gray-200">
              {item.ProductName}
            </h3>
            <p className="text-teal-400 font-bold">₹{item.ProductPrice}</p>
            <div className="flex items-center justify-between mt-3">
              <button
                className="mt-2 w-full bg-green-500 text-white font-semibold py-1 rounded hover:bg-green-900"
                onClick={() => {
                  dispatch(addToCart(item));
                }}
              >
                Add To Cart{" "}
                <FaCartPlus className="text-black inline-block ml-1" />
              </button>
              <button
                className="mt-2 ml-1 w-full bg-yellow-500 text-black font-semibold py-1 rounded hover:bg-yellow-700"
                // onClick={() => {
                //   dispatch(addToCart(item));
                // }}
              >
                Buy Now <FaBoltLightning className=" inline-block ml-1" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Products;
