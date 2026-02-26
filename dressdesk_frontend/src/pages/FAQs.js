import React, { useState } from "react";
import "./FAQ.css";

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "What is DressDesk?",
      answer:
        "DressDesk is your one-stop online clothing store offering trendy outfits for men, women, and kids."
    },
    {
      question: "How do I track my order?",
      answer:
        "Once your order is shipped, you’ll receive a tracking link via email and SMS. You can also check order status from your DressDesk account."
    },
    {
      question: "Do you provide international shipping?",
      answer:
        "Currently, DressDesk ships only within India. International shipping will be introduced soon!"
    },
    {
      question: "Can I return or exchange a product?",
      answer:
        "Yes! You can request a return or exchange within 7 days of delivery if the product is unused and in original condition."
    },
    {
      question: "What payment methods are accepted?",
      answer:
        "We accept UPI, debit/credit cards, net banking, and cash on delivery in selected areas."
    },
    {
      question: "Are there any delivery charges?",
      answer:
        "We offer free delivery on orders above ₹999. For smaller orders, a nominal delivery charge may apply."
    },
    {
      question: "How can I contact customer support?",
      answer:
        "You can reach our support team via the Contact Us page, email at support@dressdesk.com, or call our helpline (10 AM – 8 PM)."
    }
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <div className="faq-header">
        <h1>Frequently Asked Questions</h1>
        <p>
          Find answers to the most common questions about shopping with DressDesk.
        </p>
      </div>

      <div className="faq-container">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`faq-item ${activeIndex === index ? "active" : ""}`}
          >
            <button className="faq-question" onClick={() => toggleFAQ(index)}>
              {faq.question}
              <span className="faq-icon">
                {activeIndex === index ? "−" : "+"}
              </span>
            </button>
            <div className="faq-answer">
              {activeIndex === index && <p>{faq.answer}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
