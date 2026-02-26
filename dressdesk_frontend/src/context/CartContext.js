import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { getAuthHeaders } from "../services/auth";

const CartContext = createContext({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  decrementItem: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
});

const API_URL = "http://127.0.0.1:8000/api/";

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const run = async () => {
      if (!user) {
        setCart([]);
        return;
      }
      try {
        const resp = await axios.get(API_URL + "cart/", { headers: getAuthHeaders() });
        setCart(resp.data?.items || []);
      } catch {
        setCart([]);
      }
    };
    run();
  }, [user]);

  const addToCart = (product) => {
    return axios
      .post(
        API_URL + "cart/add/",
        { product_id: product.id, selected_size: product.selectedSize },
        { headers: getAuthHeaders() }
      )
      .then((resp) => setCart(resp.data?.items || []));
  };

  const removeFromCart = (productId, selectedSize) => {
    return axios
      .post(
        API_URL + "cart/remove/",
        { product_id: productId, selected_size: selectedSize },
        { headers: getAuthHeaders() }
      )
      .then((resp) => setCart(resp.data?.items || []));
  };

  const decrementItem = (productId, selectedSize) => {
    return axios
      .post(
        API_URL + "cart/decrement/",
        { product_id: productId, selected_size: selectedSize },
        { headers: getAuthHeaders() }
      )
      .then((resp) => setCart(resp.data?.items || []));
  };

  const clearCart = () => {
    return axios
      .post(API_URL + "cart/clear/", {}, { headers: getAuthHeaders() })
      .then((resp) => setCart(resp.data?.items || []));
  };

  const { totalItems, totalPrice } = useMemo(() => {
    let ti = 0, tp = 0;
    for (const it of cart) {
      const q = it.quantity || 1;
      ti += q;
      tp += Number(it.price) * q;
    }
    return { totalItems: ti, totalPrice: tp };
  }, [cart]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, decrementItem, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
