import React from 'react';
import { FaUserShield, FaHospital, FaLock, FaHandshake } from 'react-icons/fa';

const TrustFeatures: React.FC = () => {
  const features = [
    {
      icon: <FaUserShield />,
      title: "Verified Sellers",
      desc: "Every seller is background-checked and verified before listing."
    },
    {
      icon: <FaHospital />,
      title: "Healthy Pets",
      desc: "All pets come with health certificates from licensed vets."
    },
    {
      icon: <FaLock />,
      title: "Secure Payments",
      desc: "Buyer protection on all transactions with end-to-end encryption."
    },
    {
      icon: <FaHandshake />,
      title: "Trusted Marketplace",
      desc: "India's most trusted platform to buy pets from certified sellers."
    }
  ];

  return (
    <section className="features-section">
      <div className="features-container">
        {features.map((item, index) => (
          <div key={index} className="feature-item">
            <div className="feature-icon-box">
              <span className="feature-icon">{item.icon}</span>
            </div>
            <h4>{item.title}</h4>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustFeatures;
