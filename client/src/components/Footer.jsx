import { Link } from "react-router-dom";

export function Footer() {
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    alert(
      "Thanks for subscribing! You will now be notified about new listings & campus deals.",
    );
    e.target.reset();
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-col">
          <div className="footer-logo">
            <img src="/images/logo.png" alt="CampusKart Logo" />
          </div>
          <p className="footer-tagline">
            Empowering students to buy, sell & reuse - right on campus.
          </p>
          <div className="social-icons">
            <a href="#">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#">
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a href="#">
              <i className="fab fa-github"></i>
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/buy">Buy</Link>
            </li>
            <li>
              <Link to="/sell">Sell</Link>
            </li>
            <li>
              <Link to="/#how-it-works-section">How It Works</Link>
            </li>
            <li>
              <Link to="/#developers-section">About Us</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact Us</h4>
          <ul className="contact-info">
            <li>
              <i className="fas fa-map-marker-alt"></i> CampusKart Inc., Surat.
            </li>
            <li>
              <i className="fas fa-envelope"></i> contact@campuskart.edu
            </li>
            <li>
              <i className="fas fa-phone"></i> +91 99092 35348
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Stay Updated</h4>
          <p>Get notified about new listings & campus deals.</p>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input type="email" placeholder="Your email" required />
            <button type="submit">
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; 2025 CampusKart. Built with love by Students, for Students. |
          <a href="#"> Privacy Policy</a> | <a href="#">Terms of Use</a>
        </p>
      </div>
    </footer>
  );
}
