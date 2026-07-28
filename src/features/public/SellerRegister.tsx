import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowRight, FiCheckCircle, FiShield, FiTrendingUp, 
  FiPackage, FiSmartphone, FiDollarSign, FiZap 
} from 'react-icons/fi';
import { ROUTES } from '@/constants/routes';
import './SellerRegister.css';

/**
 * Merchant Registration Portal.
 * Orchestrates the onboarding experience for verified pet sellers.
 * Includes Hero, Benefits, Steps (How it Works), and final CTA.
 */
const SellerRegister: React.FC = () => {
  const navigate = useNavigate();

  const handleStartOnboarding = () => {
    // Navigates to the combined Login/Register hub with the intent to register as a seller
    navigate(ROUTES.LOGIN, { state: { role: 'seller', isRegister: true, lockRole: true } });
  };

  return (
    <div className="seller-register-page">
      {/* 1. Hero Section */}
      <section className="seller-hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
        </div>
        
        <div className="section-container">
           <div className="hero-container">
              <div className="hero-text-side">
                 <div className="section-badge pulse-animation">Merchant Portal</div>
                 <h1>Grow Your <span className="logo-accent">Pet Business</span> Globally</h1>
                 <p>Join the premier marketplace for verified pet listings. Connect with thousands of passionate buyers and manage your inventory with state-of-the-art tools.</p>
                 
                 <div className="hero-buttons">
                    <button className="primary-btn-large" onClick={handleStartOnboarding}>
                       Get Started Now <FiArrowRight />
                    </button>
                    <button className="secondary-btn-large" onClick={() => {
                        const el = document.getElementById('how-it-works');
                        el?.scrollIntoView({ behavior: 'smooth' });
                    }}>
                       How it Works
                    </button>
                 </div>

                 <div style={{ display: 'flex', gap: '40px' }}>
                    <div className="stat-mini">
                       <span className="stat-val">50K+</span>
                       <span className="stat-lbl">Active Buyers</span>
                    </div>
                    <div className="stat-mini">
                       <span className="stat-val">98%</span>
                       <span className="stat-lbl">Seller Success</span>
                    </div>
                 </div>
              </div>

              <div className="hero-visual-side">
                 <div className="mockup-frame float-animation">
                    <img 
                      src="/seller_dashboard.png" 
                      alt="Seller Dashboard Preview" 
                      className="mockup-img"
                    />
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 2. Benefits Section (Zig-Zag) */}
      <section className="benefits-modern-section" id="benefits">
        <div className="section-container">
          <header className="section-header">
            <span className="section-badge-light">Why Choose Us</span>
            <h2>The AniSell <span>Merchant Advantage</span></h2>
            <p>We provide the tools and exposure you need to scale your pet breeding or merchant business.</p>
          </header>

          <div className="benefits-feature-stack">
            <div className="benefit-row">
              <div className="benefit-content">
                <div className="benefit-num-label">EXPERIENCE 01</div>
                <h3>Verified Marketplace Protection</h3>
                <p>Every listing and buyer is verified through our proprietary identity system, ensuring a safe transaction environment for your high-value pets.</p>
                <ul className="benefit-bullets">
                  <li><FiCheckCircle /> Identity Verification</li>
                  <li><FiShield /> Secure Payments</li>
                </ul>
              </div>
              <div className="benefit-visual">
                <div className="visual-blob blob-blue">
                   <FiShield className="visual-icon" />
                </div>
              </div>
            </div>

            <div className="benefit-row alternate">
              <div className="benefit-content">
                <div className="benefit-num-label">EXPERIENCE 02</div>
                <h3>Advanced Analytics Hub</h3>
                <p>Track your store performance, view conversion rates, and identify trending breeds with our professional dashboard tools.</p>
                <ul className="benefit-bullets">
                  <li><FiTrendingUp /> Sales Tracking</li>
                  <li><FiZap /> Real-time Data</li>
                </ul>
              </div>
              <div className="benefit-visual">
                <div className="visual-blob blob-green">
                   <FiTrendingUp className="visual-icon" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Steps Section (How it Works) */}
      <section className="steps-section" id="how-it-works">
        <div className="section-container">
           <header className="section-header">
              <span className="section-badge-light">Onboarding</span>
              <h2>Four Simple <span>Steps to Scale</span></h2>
              <p>Your journey from registration to global sales is streamlined for maximum efficiency.</p>
           </header>

           <div className="steps-grid">
              {[
                { icon: <FiSmartphone />, title: 'Register Account', desc: 'Create your merchant profile and verify your identity credentials.' },
                { icon: <FiPackage />, title: 'List Inventory', desc: 'Upload high-quality media and detailed descriptions for your pets.' },
                { icon: <FiZap />, title: 'Connect & Sell', desc: 'Interact with verified buyers through our integrated inquiry hub.' },
                { icon: <FiDollarSign />, title: 'Receive Payments', desc: 'Funds are secured and transferred directly to your verified account.' }
              ].map((step, idx) => (
                <div key={idx} className="step-card">
                   <span className="step-card-num">0{idx + 1}</span>
                   <div className="step-icon-container">
                      <div className="step-icon">{step.icon}</div>
                   </div>
                   <div className="step-card-content">
                      <h4>{step.title}</h4>
                      <p>{step.desc}</p>
                   </div>
                   {idx < 3 && <div className="step-connector"></div>}
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 4. Final CTA */}
      <section className="cta-final-section">
        <div className="section-container">
           <div className="cta-content">
              <h2>Ready to expand your reach?</h2>
              <p>Join over 5,000+ verified pet merchants already growing on AniSell.</p>
              <button className="primary-btn-large pulse-animation" onClick={handleStartOnboarding}>
                 Start Selling Today <FiArrowRight />
              </button>
           </div>
        </div>
      </section>
    </div>
  );
};

export default SellerRegister;
