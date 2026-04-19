import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = (user && (user.username || user.email || user.name)) || "";

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">DressDesk</Link>
      </div>

      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/products">Products</Link></li>
        <li><Link to="/faqs">FAQs</Link></li>
        <li>
          <Link to="/cart" className="cart-link">
            <FaShoppingCart /> Cart ({cart.length})
          </Link>
        </li>

        {user ? (
          <li className="user-dropdown">
            <Link to="/orders">My Orders</Link>
            <span className="user-name">{displayName}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </li>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
