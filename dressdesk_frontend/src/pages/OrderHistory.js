import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { getAuthHeaders } from "../services/auth";
import "./OrderHistory.css";

const API_URL = "http://127.0.0.1:8000/api/";

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchOrders = async () => {
      try {
        const resp = await axios.get(API_URL + "cart/orders/", {
          headers: getAuthHeaders(),
        });
        setOrders(resp.data || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="order-history-page">
        <h1>My Orders</h1>
        <div className="order-loading">
          <div className="spinner" />
          <p>Loading your orders…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="order-history-page">
        <h1>My Orders</h1>
        <div className="order-history-empty">
          <div className="empty-icon">🔒</div>
          <p>Please log in to view your order history.</p>
          <Link to="/login">Log In</Link>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="order-history-page">
        <h1>My Orders</h1>
        <div className="order-history-empty">
          <div className="empty-icon">📦</div>
          <p>You haven't placed any orders yet.</p>
          <Link to="/products">Browse Products</Link>
        </div>
      </div>
    );
  }

  const handleDownloadPDF = async () => {
    try {
      const resp = await axios.get(API_URL + "cart/orders/download/pdf/", {
        headers: getAuthHeaders(),
        responseType: "blob",
      });
      const blobUrl = window.URL.createObjectURL(
        new Blob([resp.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `order_history_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error downloading PDF:", err);
      alert("Could not download the PDF. Please try again.");
    }
  };

  return (
    <div className="order-history-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h1 style={{ margin: 0 }}>My Orders</h1>
        <button className="download-all-btn" onClick={handleDownloadPDF}>
          ⬇ Download All Orders (PDF)
        </button>
      </div>

      {orders.map((order) => {
        const isExpanded = expandedId === order.id;
        return (
          <div className="order-card" key={order.id}>
            <div
              className="order-card-header"
              onClick={() => toggleExpand(order.id)}
            >
              <div className="order-header-left">
                <h3>Order #{order.id}</h3>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="order-header-right">
                <div className="order-total">₹{order.totalPrice.toFixed(2)}</div>
                <div className="order-items-count">
                  {order.totalItems} item{order.totalItems !== 1 ? "s" : ""}
                </div>
                <div className="order-toggle-hint">
                  {isExpanded ? "▲ Hide details" : "▼ View details"}
                </div>
              </div>
            </div>

            {isExpanded && (
              <>
                <div className="order-card-body">
                  <table className="order-items-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Size</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.productName}</td>
                          <td>{item.selectedSize || "—"}</td>
                          <td>{item.quantity}</td>
                          <td>₹{item.productPrice.toFixed(2)}</td>
                          <td>₹{item.lineTotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="order-card-footer">
                  <span className="order-summary-label">
                    Grand Total: ₹{order.totalPrice.toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrderHistory;
