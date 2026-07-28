import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-top">
        <div className="footer-column brand-col">
          <div className="footer-logo">
            <span className="logo-text">AniSell</span>
          </div>
          <p className="footer-desc">
            India's most trusted pet marketplace. Buy healthy pets and accessories from verified sellers.
          </p>
        </div>

        <div className="footer-column">
          <h5>COMPANY</h5>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/how-it-works">How It Works</Link></li>
            <li><Link to="/seller-register">Seller Registration</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/careers">Careers</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h5>SHOP</h5>
          <ul>
            <li><a href="#">Dogs</a></li>
            <li><a href="#">Cats</a></li>
            <li><a href="#">Birds</a></li>
            <li><a href="#">Fish & Aquatics</a></li>
            <li><a href="#">Pet Accessories</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h5>SUPPORT</h5>
          <ul>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">FAQs</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Buyer Protection</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p className="copyright">
            © 2025 Anisell. All rights reserved.
          </p>
          <div className="dev-credits">
            <img src="https://bustling-trick-3d0.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fpublic.notion-static.com%2Fd344584e-e21a-4e9c-8765-8f7d563070cc%2Fdeadend_logo_(3).png?table=custom_emoji&id=3139801e-d37b-80f2-a1b7-007a38c942a5&spaceId=5739801e-d37b-8171-934c-0003c9bb7643&width=160&userId=&cache=v2" alt="Dev Logo" className="dev-logo" />
            <span>Developed by <a href="mailto:deadendengineer@gmail.com">deadendengineer@gmail.com</a></span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
