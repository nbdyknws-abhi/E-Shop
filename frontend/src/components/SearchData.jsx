import React from "react";
import { useEffect,useState} from "react";
import { FaTimes } from "react-icons/fa";
function SearchData({ onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
        if(query.trim()){
            fetch(`/api/search?q=${query}`)
            .then((res) => {
              return res.json();
            })
            .then((result) => {
              setResults(result.data );
            })
            .catch((err) => {
              console.error("Error fetching search results:", err);
            });

        } 
    }, 500); 
    return () => clearTimeout(delayDebounce);
  }, [query]);
  
  return (
    <div className="fixed inset-0 bg-white shadow-lg rounded-lg p-4 z-[1000] overflow-y-auto ">
      {/* Search results will be displayed here */}
      <div className="flex justify-between items-center mb-4 gap-4 px-4 w-full">
        <input
          type="text"
          placeholder="Search..."
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          className="text-xl flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 w-full "
        />
        <button
          className=" rounded-full hover:text-red-500 hover:bg-red-400 p-1 text-3xl linear duration-300 "
          onClick={() => onClose(false)}
        >
          <FaTimes />
        </button>
        
      </div>
      {/* Search Result */}
        <div className="mt-4 space-y-4 ">
          {results.length>0 ? (results.map((item) => (
            <div key={item._id} className="border-b p-2 shadow-sm rounded-lg flex  justify-between items-center">
                <div className="flex-shrink-0 flex w-auto gap-4">
                    <img
              src={`/uploads/${item.ProductImage}`}
              alt="ProductImage"
              className="w-16 h-12 object-contain rounded "
            />
                <h3 className="text-lg font-semibold">{item.ProductName}</h3>
              <p className="text-sm text-gray-600">{item.ProductCat}</p>
                </div>
            </div>
          ))
        ):query.trim() !== "" && (
      <p className="text-red-600 text-center text-xl">
        No results found. Try searching for something else.
      </p>)}
        </div>
    </div>
    
  );
}

export default SearchData;
