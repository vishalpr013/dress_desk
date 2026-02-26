import React from 'react';
import './Home.css';

const Home = () => {
    return (
        <div className="home-landing">

            <section className="hero">
                <div className="hero-text">
                    <h1>Welcome to DressDesk</h1>
                    <p>Trendy, high-quality clothes delivered to your door.</p>
                    <a href="/products" className="shop-btn">Shop Now</a>
                </div>
                <div className="hero-image">
                    <img 
                        src="https://cdni.iconscout.com/illustration/premium/thumb/clothing-store-exterior-6429545-5314302.png" 
                        alt="Fashion Banner" 
                    />
                </div>
            </section>

            <section className="about">
                <h2>About DressDesk</h2>
                <p>
                    DressDesk is your go-to online store for the latest fashion trends. 
                    We provide high-quality clothes for men, women, and kids, all in one place. 
                    Our goal is to make shopping easy, fun, and reliable.
                </p>
            </section>

            <section className="why-choose-us">
                <h2>Why Choose Us?</h2>
                <div className="choose-cards">
                    <div className="choose-card">
                        <h3>Premium Quality</h3>
                        <p>We ensure all products meet high-quality standards.</p>
                    </div>
                    <div className="choose-card">
                        <h3>Fast Delivery</h3>
                        <p>Receive your favorite outfits quickly at your doorstep.</p>
                    </div>
                    <div className="choose-card">
                        <h3>Easy Returns</h3>
                        <p>Hassle-free returns to make shopping worry-free.</p>
                    </div>
                </div>
            </section>

            <section className="testimonials">
                <h2>What Our Customers Say</h2>
                <div className="testimonial-cards">
                    <div className="testimonial-card">
                        <p>"Great quality and fast delivery! Loved the shopping experience."</p>
                        <h4>- Jay.</h4>
                    </div>
                    <div className="testimonial-card">
                        <p>"I always find trendy outfits here. Highly recommended!"</p>
                        <h4>- Meet.</h4>
                    </div>
                    <div className="testimonial-card">
                        <p>"Customer service is amazing and returns are super easy."</p>
                        <h4>- Heer.</h4>
                    </div>
                </div>
            </section>

            <section className="collections">
                <h2>Featured Collections</h2>
                <div className="collection-cards">
                    <div className="collection-card">Boys</div>
                    <div className="collection-card">Girls</div>
                    <div className="collection-card">Mens</div>
                    <div className="collection-card">Womens</div>
                </div>
            </section>

        </div>
    );
};

export default Home;
