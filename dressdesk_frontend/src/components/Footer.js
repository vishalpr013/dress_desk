import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-bottom">
                <div className="footer-bottom-left">
                    <h3>About DressDesk</h3>
                    <p>
                        DressDesk is your go-to online store for trendy clothes. 
                        High quality, fast delivery, and easy returns.
                    </p>
                </div>
                <div>
                    &copy; {new Date().getFullYear()} DressDesk. All Rights Reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
