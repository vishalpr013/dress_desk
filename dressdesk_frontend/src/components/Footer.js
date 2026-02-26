import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-about">
                    <h3>About DressDesk</h3>
                    <p>
                        DressDesk is your go-to online store for trendy clothes. 
                        High quality, fast delivery, and easy returns.
                    </p>
                </div>

                <div className="footer-links">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><a href="/">Home</a></li>
                        <li><a href="/products">Products</a></li>
                        <li><a href="/cart">Cart</a></li>
                        <li><a href="/login">Login/Register</a></li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                &copy; {new Date().getFullYear()} DressDesk. All Rights Reserved.
            </div>
        </footer>
    );
};

export default Footer;
