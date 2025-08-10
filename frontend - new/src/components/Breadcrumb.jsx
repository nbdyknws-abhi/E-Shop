import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaChevronRight, FaHome } from "react-icons/fa";

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const breadcrumbNameMap = {
    "": "Home",
    login: "Login",
    reg: "Register",
    cart: "Shopping Cart",
    contact: "Contact Us",
    admin: "Admin Dashboard",
    products: "Products",
    addproduct: "Add Product",
    "edit-product": "Edit Product",
    "admin-query": "Customer Queries",
    "admin-reply": "Reply to Query",
  };

  // Don't show breadcrumb on home page
  if (location.pathname === "/" ) return null;

  return (
    <nav className="bg-gray-50 py-3 mt-16">
      <div className="max-w-7xl mx-auto">
        <ol className="flex items-center space-x-2 text-sm">
          {/* Home Link */}
          <li>
            <Link
              to="/"
              className="flex items-center text-gray-500 hover:text-green-600 transition-colors"
            >
              <FaHome className="mr-1" />
              Home
            </Link>
          </li>

          {/* Dynamic Breadcrumbs */}
          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathnames.length - 1;
            const displayName =
              breadcrumbNameMap[name] ||
              name.charAt(0).toUpperCase() + name.slice(1);

            return (
              <li key={name} className="flex items-center">
                <FaChevronRight className="mx-2 text-gray-400 text-xs" />
                {isLast ? (
                  <span className="text-gray-800 font-medium">
                    {displayName}
                  </span>
                ) : (
                  <Link
                    to={routeTo}
                    className="text-gray-500 hover:text-green-600 transition-colors"
                  >
                    {displayName}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb;
