import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ user: "", comment: "" });

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/products/${id}/`)
      .then(res => setProduct(res.data));

    axios.get(`http://127.0.0.1:8000/api/products/${id}/reviews/`)
      .then(res => setReviews(res.data));
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://127.0.0.1:8000/api/products/${id}/add_review/`, form);
      setForm({ user: "", comment: "" });
      const res = await axios.get(`http://127.0.0.1:8000/api/products/${id}/reviews/`);
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!product) return <p>Loading...</p>;

  return (
    <div className="product-detail">
      <img src={product.image} alt={product.name} />
      <div className="product-info">
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <p className="price">₹{product.price}</p>

      
        <div className="reviews">
          <h3>Reviews</h3>
          {reviews.length > 0 ? reviews.map((r, idx) => (
            <div className="review" key={idx}>
              <strong>{r.user}</strong>
              <p>{r.comment}</p>
            </div>
          )) : <p>No reviews yet.</p>}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="user"
              placeholder="Your name"
              value={form.user}
              onChange={handleChange}
              required
            />
            <textarea
              name="comment"
              placeholder="Write a review..."
              value={form.comment}
              onChange={handleChange}
              required
            />
            <button type="submit">Submit Review</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
