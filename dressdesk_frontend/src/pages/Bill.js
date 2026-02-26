import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "./Bill.css";

const Bill = () => {
  const location = useLocation();
  const { cart, user } = location.state || { cart: [], user: {} };

  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const response = await axios.post("http://127.0.0.1:8000/api/products/generate_bill/", {
          cart,
          user,
        });
        setBill(response.data);
      } catch (error) {
        console.error("Error generating bill:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBill();
  }, [cart, user]);

  const downloadCSV = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/products/download_bill_csv/",
        { cart, user },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "bill.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading CSV:", error);
      alert("⚠️ Error generating bill (CSV)");
    }
  };

  const downloadPDF = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/products/download_bill_pdf/",
        { cart, user },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "bill.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("⚠️ Error generating bill (PDF)");
    }
  };

  if (loading) return <h2>Loading bill...</h2>;

  if (!bill) return <h2>⚠️ No bill available</h2>;

  return (
    <div className="bill-container">
      <h1 className="bill-title">🛒 DressDesk Bill</h1>
      <div className="bill-user">
        <p><strong>Name:</strong> {bill.buyer}</p>
        <p><strong>Phone:</strong> {bill.phone}</p>
      </div>

      <table className="bill-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price (₹)</th>
            <th>Quantity</th>
            <th>Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item, idx) => (
            <tr key={idx}>
              <td>{item.name}</td>
              <td>{item.price}</td>
              <td>{item.quantity}</td>
              <td>{item.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="bill-summary">
        <h3>Total Items: {bill.total_items}</h3>
        <h3>Grand Total: ₹{bill.total_price}</h3>
      </div>

      <div className="bill-actions">
        <button onClick={downloadCSV} className="btn">⬇ Download CSV</button>
        <button onClick={downloadPDF} className="btn">⬇ Download PDF</button>
      </div>
    </div>
  );
};

export default Bill;
