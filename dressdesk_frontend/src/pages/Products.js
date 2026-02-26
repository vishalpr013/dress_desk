import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Products.css";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product, addToCart }) => {
  const [selectedSize, setSelectedSize] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size!");
      return;
    }

    if (!user) {
      alert("Please login or register before adding items to your cart.");
      navigate("/login", { state: { from: "/products", reason: "add_to_cart" } });
      return;
    }

    addToCart({ ...product, selectedSize });
  };

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} className="product-img" />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <span className="price">₹{product.price}</span>

      <div className="size-selector">
        {product.sizes?.map((size) => (
          <button
            key={size}
            className={`size-btn ${selectedSize === size ? "selected" : ""}`}
            onClick={() => setSelectedSize(size)}
          >
            {size}
          </button>
        ))}
      </div>

      <button className="buy-btn" onClick={handleAddToCart}>
        Add to Cart
      </button>
    </div>
  );
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/products/")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  }, []);

  const boysWear = products.filter((p) => p.category === "boys");
  const girlsWear = products.filter((p) => p.category === "girls");
  const mensWear = products.filter((p) => p.category === "mens");
  const womensWear = products.filter((p) => p.category === "womens");

  return (
    <div className="products-page">
      <h1 className="page-title">Our Collection</h1>

      <section>
        <h2>Boys Wear</h2>
        <div className="products-grid">
          {boysWear.length > 0
            ? boysWear.map((p) => (
                <ProductCard key={p.id} product={p} addToCart={addToCart} />
              ))
            : <p>No Boys Wear available</p>}
        </div>
      </section>

      <section>
        <h2>Girls Wear</h2>
        <div className="products-grid">
          {girlsWear.length > 0
            ? girlsWear.map((p) => (
                <ProductCard key={p.id} product={p} addToCart={addToCart} />
              ))
            : <p>No Girls Wear available</p>}
        </div>
      </section>

      <section>
        <h2>Mens Wear</h2>
        <div className="products-grid">
          {mensWear.length > 0
            ? mensWear.map((p) => (
                <ProductCard key={p.id} product={p} addToCart={addToCart} />
              ))
            : <p>No Mens Wear available</p>}
        </div>
      </section>

      <section>
        <h2>Womens Wear</h2>
        <div className="products-grid">
          {womensWear.length > 0
            ? womensWear.map((p) => (
                <ProductCard key={p.id} product={p} addToCart={addToCart} />
              ))
            : <p>No Womens Wear available</p>}
        </div>
      </section>
    </div>
  );
};

export default Products;
