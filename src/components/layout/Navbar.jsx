import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Icon, WhatsAppIcon } from "../ui";
import { searchProducts } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { label: "Shop Cameras", path: "/category/cameras" },
  { label: "Camera Kits", path: "/packages" },
  { label: "Compare", path: "/compare" },
  { label: "Reviews", path: "/#reviews" },
  { label: "Support", path: "/contact" },
];

export default function Navbar({ compareCount = 0, cartCount = 0 }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, logout } = useAuth();

  // Close menus on route change
  useEffect(() => {
    const timer = setTimeout(() => {
      setMobileOpen(false);
      setSearchOpen(false);
      setProfileOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 220);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Search query
  useEffect(() => {
    let active = true;
    if (debouncedSearch.length < 2) {
      Promise.resolve().then(() => {
        if (active) {
          setSearchResults([]);
          setSearching(false);
        }
      });
      return () => { active = false; };
    }
    Promise.resolve().then(() => {
      if (active) setSearching(true);
    });
    searchProducts(debouncedSearch, 8)
      .then((results) => { if (active) setSearchResults(results); })
      .catch(() => { if (active) setSearchResults([]); })
      .finally(() => { if (active) setSearching(false); });
    return () => { active = false; };
  }, [debouncedSearch]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const goto = (path) => {
    if (path.startsWith("/#")) {
      const id = path.replace("/#", "");
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(path);
    }
    setMobileOpen(false);
    setSearchOpen(false);
    setProfileOpen(false);
  };

  const openProduct = (productId) => {
    setSearchTerm("");
    setSearchResults([]);
    setSearchOpen(false);
    goto(`/product/${productId}`);
  };

  const openWhatsApp = () => {
    window.open(`https://wa.me/917975782567?text=Hi Digitron Associates, I would like to enquire about CCTV cameras and installation.`, "_blank");
  };

  return (
    <div className="nav-wrapper">
      {/* Tier 1: Dark Navy Announcement Marquee */}
      <div className="nav-announcement-top">
        <div className="marq">
          {[
            "FREE INSTALLATION on all camera kits",
            "Pay after installation",
            "Free site survey in Hubballi–Dharwad",
            "Mobile viewing set up on handover",
            "FREE INSTALLATION on all camera kits",
            "Pay after installation",
            "Free site survey in Hubballi–Dharwad",
            "Mobile viewing set up on handover",
          ].map((text, idx) => (
            <span key={idx} className="marq-item">
              <span>{text}</span>
              <span className="sparkle">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Tier 2: Signal Blue Promo Bar with blinking dot */}
      <div className="nav-promo-bar">
        <span className="nav-promo-dot blink"></span>
        <span>
          <strong>Festive offer live:</strong> Free installation on every camera kit —{" "}
          <a href="tel:+917975782567">call 79757 82567</a>
        </span>
      </div>

      {/* Tier 3: Main Header */}
      <header className="navbar">
        {/* Brand Logo with Kannada script */}
        <div className="nav-logo" onClick={() => goto("/")}>
          <svg className="nav-logo-mark" viewBox="0 0 48 44" fill="none">
            <path d="M4 3h20a19 19 0 0 1 0 38H4z" fill="#1A6FD6" stroke="#0B1F3A" strokeWidth="3" strokeLinejoin="round" />
            <path d="M9 38L23 12l14 26z" fill="#FFFFFF" stroke="#0B1F3A" strokeWidth="2.6" strokeLinejoin="round" />
            <path d="M23 34V23M19.5 26.5L23 23l3.5 3.5" stroke="#0B1F3A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="nav-logo-text-group">
            <span className="nav-logo-brand h">DIGITRON</span>
            <span className="nav-logo-sub kn">ಡಿಜಿಟ್ರಾನ್ ಅಸೋಸಿಯೇಟ್ಸ್</span>
          </div>
        </div>

        {/* Desktop Links */}
        <nav className="nav-links">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.path}
              className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                goto(item.path);
              }}
            >
              {item.label}
              {item.label === "Compare" && compareCount > 0 && (
                <span className="mobile-link-badge" style={{ marginLeft: 6 }}>{compareCount}</span>
              )}
            </a>
          ))}
        </nav>

        {/* Nav Actions */}
        <div className="nav-actions">
          {/* Search Trigger & Dropdown */}
          <div className="nav-search-container" ref={searchRef}>
            <button
              type="button"
              className="nav-icon-circle-btn"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search products"
            >
              <Icon name="search" size={20} />
            </button>

            {searchOpen && (
              <div className="global-search-input-wrap">
                <div className="nav-search-box">
                  <Icon name="search" size={16} />
                  <input
                    autoFocus
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search cameras, DVRs, kits..."
                    aria-label="Search products"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      style={{ border: 0, background: "transparent", cursor: "pointer", color: "var(--color-slate)" }}
                    >
                      <Icon name="x" size={14} />
                    </button>
                  )}
                </div>

                {debouncedSearch.length >= 2 && (
                  <div className="global-search-results">
                    {searching ? (
                      <div style={{ padding: "12px", textAlign: "center", fontSize: 13, color: "var(--color-slate)" }}>
                        Searching Digitron catalog...
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div style={{ padding: "12px", textAlign: "center", fontSize: 13, color: "var(--color-slate)" }}>
                        No matching equipment found
                      </div>
                    ) : (
                      searchResults.map((product) => (
                        <button
                          key={product.id}
                          className="search-item"
                          onClick={() => openProduct(product.id)}
                        >
                          <div>
                            <strong>{product.name}</strong>
                            <small>{product.brand} · {product.category}</small>
                          </div>
                          <em>{product.price > 0 ? `₹${product.price.toLocaleString("en-IN")}` : "Quote"}</em>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Button */}
          <button
            type="button"
            className="nav-icon-circle-btn"
            onClick={() => goto("/cart")}
            aria-label={`Enquiry cart, ${cartCount} items`}
          >
            <Icon name="shoppingCart" size={20} />
            {cartCount > 0 && <span className="nav-icon-badge">{cartCount}</span>}
          </button>

          {/* User Profile / Login */}
          <div className="nav-profile" ref={profileRef}>
            {user ? (
              <>
                <button
                  type="button"
                  className="nav-avatar-btn"
                  onClick={() => setProfileOpen(!profileOpen)}
                  aria-label="User account"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <span className="nav-avatar-initial">{(user.name || "U").charAt(0).toUpperCase()}</span>
                  )}
                </button>
                {profileOpen && (
                  <div className="nav-profile-menu">
                    <button onClick={() => goto("/profile")}><Icon name="user" size={14} /> My Profile</button>
                    <button onClick={() => goto("/cart")}><Icon name="shoppingCart" size={14} /> My Cart</button>
                    <button onClick={logout}><Icon name="logOut" size={14} /> Logout</button>
                  </div>
                )}
              </>
            ) : (
              <button
                type="button"
                className="btn-login-pill"
                onClick={() => login(location.pathname + location.search)}
              >
                <span className="google-mark">G</span>
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Shop Now Primary Button */}
          <button
            type="button"
            className="btn btn-shop-now"
            onClick={() => goto("/packages")}
          >
            Shop Now
          </button>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            type="button"
            className="nav-hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <Icon name={mobileOpen ? "x" : "menu"} size={22} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <div
        className={`mobile-menu-overlay ${mobileOpen ? "mobile-menu-overlay--visible" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile Menu Drawer */}
      <div className={`mobile-menu ${mobileOpen ? "mobile-menu--open" : ""}`}>
        <div className="mobile-menu-header">
          <div className="nav-logo" onClick={() => goto("/")}>
            <svg className="nav-logo-mark" viewBox="0 0 48 44" fill="none" style={{ width: 32, height: 29 }}>
              <path d="M4 3h20a19 19 0 0 1 0 38H4z" fill="#1A6FD6" stroke="#0B1F3A" strokeWidth="3" strokeLinejoin="round" />
              <path d="M9 38L23 12l14 26z" fill="#FFFFFF" stroke="#0B1F3A" strokeWidth="2.6" strokeLinejoin="round" />
            </svg>
            <span className="nav-logo-brand h" style={{ fontSize: 18 }}>DIGITRON</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            style={{ border: 0, background: "transparent", cursor: "pointer", color: "var(--color-navy)" }}
          >
            <Icon name="x" size={22} />
          </button>
        </div>

        <div className="nav-search-box" style={{ margin: "8px 0" }}>
          <Icon name="search" size={16} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
          />
        </div>

        <div className="mobile-menu-links">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className={`mobile-menu-link ${location.pathname === item.path ? "mobile-menu-link--active" : ""}`}
              onClick={() => goto(item.path)}
            >
              <span>{item.label}</span>
              {item.label === "Compare" && compareCount > 0 && (
                <span className="mobile-link-badge">{compareCount}</span>
              )}
            </div>
          ))}
          <div className="mobile-menu-link" onClick={() => goto("/cart")}>
            <Icon name="shoppingCart" size={18} />
            <span>Cart {cartCount > 0 ? `(${cartCount})` : ""}</span>
          </div>
          <div className="mobile-menu-link" onClick={openWhatsApp}>
            <WhatsAppIcon size={18} />
            <span>Chat on WhatsApp</span>
          </div>
        </div>

        <button
          type="button"
          className="btn"
          onClick={() => goto("/packages")}
          style={{
            marginTop: "auto",
            height: 52,
            borderRadius: 999,
            background: "var(--brand)",
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: 700,
            border: 0,
          }}
        >
          Shop Camera Kits →
        </button>
      </div>
    </div>
  );
}
