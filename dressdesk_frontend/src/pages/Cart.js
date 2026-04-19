import React from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuthHeaders } from "../services/auth";
import "./Cart.css";

const Cart = () => {
  const { cart, addToCart, removeFromCart, decrementItem, clearCart, checkout, totalItems, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const requireLogin = () => {
    if (!user) {
      alert("Please log in or register before modifying your cart.");
      navigate("/login");
      return false;
    }
    return true;
  };

  const handleBuyNow = async () => {
    if (!requireLogin()) return;
    try {
      await checkout();
      navigate("/orders");
    } catch (e) {
      console.error("Checkout failed:", e);
      alert("Could not complete your purchase. Please try again.");
    }
  };

  const handleDownloadPDF = async () => {
    if (!requireLogin()) return;
    try {
      const resp = await axios.get("http://127.0.0.1:8000/api/cart/download/pdf/", {
        headers: getAuthHeaders(),
        responseType: "blob",
      });
      const blobUrl = window.URL.createObjectURL(new Blob([resp.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `order_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      alert("Could not download the PDF. Please try again.");
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="cart-page">
        <h1>Your Cart</h1>
        <p className="empty-cart">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>
      <div className="cart-list">
        {cart.map((item) => (
          <div className="cart-item" key={`${item.id}-${item.selectedSize || ""}`}>
            <img src={item.image} alt={item.name} className="cart-img" />
            <div className="cart-details">
              <h3>{item.name}</h3>
              <p className="cart-price">₹{item.price}</p>

              {item.sizes && item.selectedSize && (
                <p className="cart-size">
                  Size: <b>{item.selectedSize}</b>
                </p>
              )}

              <div className="qty-row">
                <button
                  className="qty-btn"
                  onClick={() => {
                    if (requireLogin()) decrementItem(item.id, item.selectedSize);
                  }}
                >
                  -
                </button>
                <span className="qty">{item.quantity || 1}</span>
                <button
                  className="qty-btn"
                  onClick={() => {
                    if (requireLogin()) addToCart({ ...item, selectedSize: item.selectedSize });
                  }}
                >
                  +
                </button>
              </div>
            </div>
            <button
              className="remove-btn"
              onClick={() => {
                if (requireLogin()) removeFromCart(item.id, item.selectedSize);
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="summary-line"><span>Items:</span> {totalItems}</div>
        <div className="summary-line"><span>Total:</span> ₹{totalPrice.toFixed(2)}</div>
        <button
          className="clear-btn"
          onClick={() => {
            if (requireLogin()) clearCart();
          }}
        >
          Clear Cart
        </button>
        <button className="buy-btn" onClick={handleBuyNow}>Buy Now</button>
        <button className="clear-btn" onClick={handleDownloadPDF} style={{marginLeft: 8}}>⬇ Download PDF</button>
      </div>
    </div>
  );
};

export default Cart;
