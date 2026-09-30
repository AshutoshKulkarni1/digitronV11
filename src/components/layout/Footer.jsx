import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-top-grid">
        <div className="footer-brand-info">
          <span className="footer-headline h">Stay one step ahead.</span>
          <span className="footer-address">
            Maratha Colony Main Road, Above Muthoot Finance, Near Old S.P. Circle, Dharwad
          </span>
          <a href="tel:+917975782567" className="footer-phone-link h">
            +91 79757 82567
          </a>
        </div>

        <div className="footer-links-columns">
          <div className="footer-col">
            <span className="footer-col-title">SHOP</span>
            <Link to="/category/cameras" className="footer-nav-link">Cameras</Link>
            <Link to="/category/dvr" className="footer-nav-link">DVR &amp; NVR</Link>
            <Link to="/category/storage" className="footer-nav-link">Storage &amp; HDDs</Link>
            <Link to="/packages" className="footer-nav-link">Camera Kits</Link>
            <Link to="/category/networking" className="footer-nav-link">Networking</Link>
            <Link to="/category/accessories" className="footer-nav-link">Accessories</Link>
          </div>

          <div className="footer-col">
            <span className="footer-col-title">SERVICES</span>
            <Link to="/packages" className="footer-nav-link">Installation</Link>
            <Link to="/contact" className="footer-nav-link">AMC &amp; repairs</Link>
            <a href="https://wa.me/917975782567?text=Hi, I would like to schedule a free site survey in Dharwad." className="footer-nav-link" target="_blank" rel="noreferrer">
              Free Site survey
            </a>
          </div>

          <div className="footer-col">
            <span className="footer-col-title">HELP</span>
            <a href="/#faq" className="footer-nav-link">FAQs</a>
            <a href="/#reviews" className="footer-nav-link">Reviews</a>
            <a href="https://wa.me/917975782567" className="footer-nav-link" target="_blank" rel="noreferrer">
              WhatsApp Support
            </a>
          </div>
        </div>
      </div>

      {/* Giant Typography Watermark */}
      <div className="footer-watermark">DIGITRON</div>

      <div className="footer-bottom-bar">
        <span>© 2026 Digitron Associates, Dharwad. All rights reserved.</span>
        <span>GSTIN: 29CSDPP2595N1ZV</span>
      </div>
    </footer>
  );
}
