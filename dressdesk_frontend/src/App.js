import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Footer from './components/Footer';
import Products from './pages/Products';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import ProductDetail from './pages/ProductDetail';
import Bill from './pages/Bill';
import FAQs from './pages/FAQs';

function App() {
  return (
    <AuthProvider>
    <CartProvider>
      <Router>
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/bill" element={<Bill />} />
          <Route path="/faqs" element={<FAQs />} />


        </Routes>

        <Footer />
      </Router>
    </CartProvider>
    </AuthProvider>
  );
}

export default App;
