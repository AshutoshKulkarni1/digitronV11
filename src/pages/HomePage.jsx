import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../components/ui";
import { Footer } from "../components/layout";
import { useCart } from "../context/CartContext";
import products from "../data/products";

// Curated Bestsellers from authentic Digitron catalog
const BESTSELLERS = [
  {
    id: 106,
    name: "Multi-Power 4G Solar PTZ Dual-Lens Security Camera",
    spec: "Solar powered · 4G LTE SIM · 360° PTZ · Color night vision",
    img: "/productImages/multi-power-solar.png",
    bg: "#EAF3FD",
    tag: "SOLAR 4G",
    tagBg: "#080B10",
    rev: "75+",
    type: "Home",
    types: ["Home", "Outdoor", "Shop"],
  },
  {
    id: 102,
    name: "CP Plus 2.4 MP HD Weatherproof Bullet Camera",
    spec: "IP67 housing · 30m Smart IR · Full HD 1080p · Rugged metal body",
    img: "/productImages/cp-plus-square.png",
    bg: "#D6E8FB",
    tag: "BESTSELLER",
    tagBg: "#080B10",
    rev: "98+",
    type: "Shop",
    types: ["Shop", "Outdoor", "Home"],
  },
  {
    id: 101,
    name: "CP Plus 2.4 MP HD Dome Camera",
    spec: "Wide 3.6mm lens · Built-in audio mic · 20m IR · Indoor ceiling",
    img: "/productImages/cp-plus-round.png",
    bg: "#EAF3FD",
    tag: "VALUE",
    tagBg: "#080B10",
    rev: "140+",
    type: "Home",
    types: ["Home", "Shop", "Office"],
  },
  {
    id: 104,
    name: "CP Plus ezyKam+ 4MP Full Color Outdoor PT Camera",
    spec: "4MP Quad HD · Dual spotlights · 355° PTZ · Humanoid AI tracking",
    img: "/productImages/ezykam-plus-square.png",
    bg: "#D6E8FB",
    tag: "FULL COLOR",
    tagBg: "#080B10",
    rev: "84+",
    type: "Home",
    types: ["Home", "Shop", "Outdoor"],
  },
  {
    id: 103,
    name: "CP Plus ezyKam+ 3MP Smart Wi-Fi PT Home Camera",
    spec: "360° pan-tilt · Two-way audio · Motion tracking · Alexa & Google",
    img: "/productImages/ezykam-plus.png",
    bg: "#EAF3FD",
    tag: "SMART WI-FI",
    tagBg: "#080B10",
    rev: "116+",
    type: "Home",
    types: ["Home", "Shop", "Office"],
  },
  {
    id: 105,
    name: "Trueview 3MP Smart Dual-Light Color Night Dome Camera",
    spec: "Smart Dual-Light IR + Warm LED · Built-in mic · Vandal-resistant metal",
    img: "/productImages/trueview-round.png",
    bg: "#EAF3FD",
    tag: "DUAL LIGHT",
    tagBg: "#080B10",
    rev: "165+",
    type: "Office",
    types: ["Office", "Shop", "Home"],
  },
  {
    id: 107,
    name: "Secureye Defender Duo 4G Dual Lens Outdoor PT Camera",
    spec: "4G/5G SIM card · Dual-lens linkage · IP65 outdoor · Real-time siren",
    img: "/productImages/secureeye.png",
    bg: "#D6E8FB",
    tag: "DUAL LENS",
    tagBg: "#080B10",
    rev: "92+",
    type: "Shop",
    types: ["Shop", "Office", "Outdoor"],
  },
  {
    id: 109,
    name: "WD Blue 500GB Surveillance & PC Hard Drive",
    spec: "24/7 continuous duty · 32MB cache · 7200 RPM · Error-free video streaming",
    img: "/productImages/500gb-wd.png",
    bg: "#D6E8FB",
    tag: "STORAGE",
    tagBg: "#080B10",
    rev: "210+",
    type: "Office",
    types: ["Office", "Shop", "Home"],
  },
  {
    id: 111,
    name: "Securus 8-Port Fast Ethernet PoE Switch (6+2 Uplink)",
    spec: "6 PoE ports + 2 Uplink · IEEE 802.3af/at 78W · 250m long range mode",
    img: "/productImages/securus-switch.png",
    bg: "#EAF3FD",
    tag: "POE SWITCH",
    tagBg: "#080B10",
    rev: "54+",
    type: "Office",
    types: ["Office", "Shop", "Home"],
  },
  {
    id: 110,
    name: "Securus CAT6 Full Copper Cable (305m Roll)",
    spec: "100% pure electrolytic bare copper · 250MHz gigabit · Low smoke PVC",
    img: "/productImages/securus-cables.png",
    bg: "#D6E8FB",
    tag: "PURE COPPER",
    tagBg: "#080B10",
    rev: "88+",
    type: "Office",
    types: ["Office", "Shop"],
  },
  {
    id: 108,
    name: "Voltaic POE Junction Box DVR Enclosure with Lock",
    spec: "14x11x5 inch · Anti-theft metal key lock · Weatherproof & UV protected",
    img: "/productImages/voltaic.png",
    bg: "#EAF3FD",
    tag: "ENCLOSURE",
    tagBg: "#080B10",
    rev: "68+",
    type: "Shop",
    types: ["Shop", "Home", "Office"],
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // State management matching design
  const [secs, setSecs] = useState(8 * 3600 + 14 * 60 + 36);
  const [kitIndex, setKitIndex] = useState(1); // default 4 cameras (Home)
  const [openFaq, setOpenFaq] = useState(0);
  const [activeTab, setActiveTab] = useState("All");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [wishlist, setWishlist] = useState({});
  const [addedId, setAddedId] = useState(null);
  const [isCategoryPaused, setIsCategoryPaused] = useState(false);
  const [categoryDirection, setCategoryDirection] = useState("normal");
  const [categoryViewMode, setCategoryViewMode] = useState("sliding");

  useEffect(() => {
    document.title = "Digitron Associates — CCTV Cameras, Kits & Installation (Hubballi–Dharwad)";
  }, []);

  // Countdown timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setSecs((s) => (s > 0 ? s - 1 : 8 * 3600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n) => String(n).padStart(2, "0");
  const hours = pad(Math.floor(secs / 3600));
  const mins = pad(Math.floor((secs % 3600) / 60));
  const seconds = pad(secs % 60);

  // Kit definitions
  const kitDefs = [
    { n: 2, label: "Starter", price: 12999, mrp: 18500, popular: false },
    { n: 4, label: "Home", price: 19999, mrp: 28500, popular: true },
    { n: 8, label: "Shop / Office", price: 34999, mrp: 49999, popular: false },
    { n: 16, label: "Business", price: 64999, mrp: 92000, popular: false },
  ];
  const currentKit = kitDefs[kitIndex];

  // Inclusions for the selected kit
  const kitIncludes = useMemo(() => [
    `${currentKit.n} HD weatherproof cameras (dome & bullet mix)`,
    `${currentKit.n <= 4 ? 4 : currentKit.n <= 8 ? 8 : 16}-channel DVR / NVR continuous recorder`,
    "Surveillance-grade Hard Disk with auto overwrite",
    "Copper cabling, BNC/DC connectors & power supply",
    "Professional concealed installation by local technicians",
    "Mobile app setup on Android & iPhone with walkthrough",
  ], [currentKit]);

  // Categories with images - Curated authentic catalog categories
  const categories = useMemo(() => {
    const counts = products.reduce((acc, p) => {
      const slug = p.category ? p.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : "";
      acc[slug] = (acc[slug] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: "Cameras", count: `${counts["cameras"] || 7} products`, img: "/productImages/cp-plus-round.png", bg: "#EAF3FD", slug: "cameras" },
      { name: "Smart Wi-Fi", count: "2 products", img: "/productImages/ezykam-plus.png", bg: "#D6E8FB", slug: "cameras?type=Wi-Fi" },
      { name: "4G & Solar", count: "2 products", img: "/productImages/multi-power-solar.png", bg: "#EAF3FD", slug: "cameras?type=Solar%204G" },
      { name: "HD Bullet", count: "1 product", img: "/productImages/cp-plus-square.png", bg: "#D6E8FB", slug: "cameras?type=Bullet" },
      { name: "HD Dome", count: "2 products", img: "/productImages/trueview-round.png", bg: "#EAF3FD", slug: "cameras?type=Dome" },
      { name: "Storage & HDDs", count: `${counts["storage-hdds"] || 1} product`, img: "/productImages/500gb-wd.png", bg: "#D6E8FB", slug: "storage" },
      { name: "Networking", count: `${counts["networking"] || 1} product`, img: "/productImages/securus-switch.png", bg: "#EAF3FD", slug: "networking" },
      { name: "Cables & Wire", count: `${counts["cables-wire"] || 1} product`, img: "/productImages/securus-cables.png", bg: "#D6E8FB", slug: "cables-connectors" },
      { name: "Racks & Enclosures", count: `${counts["racks-enclosures"] || 1} product`, img: "/productImages/voltaic.png", bg: "#EAF3FD", slug: "mounting-enclosures" },
      { name: "Dual-Lens PT", count: "2 products", img: "/productImages/secureeye.png", bg: "#D6E8FB", slug: "cameras?type=Solar%204G" },
    ];
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeTab === "All") return BESTSELLERS;
    return BESTSELLERS.filter((p) => p.type === activeTab || (p.types && p.types.includes(activeTab)));
  }, [activeTab]);

  // FAQs
  const faqs = [
    {
      q: "Do you provide installation with every camera?",
      a: "Yes. Our own trained technicians install every system, run neat concealed cabling where possible, and configure the mobile app on all your family members' phones before leaving.",
    },
    {
      q: "Can I watch my cameras on my phone from outside?",
      a: "Every system we install supports instant live view and playback on Android and iPhone with instant motion alert notifications anywhere with internet.",
    },
    {
      q: "Is a site survey really free in Hubballi–Dharwad?",
      a: "Yes — 100% free with zero obligation. We visit your property, inspect blind spots, suggest optimal camera angles, and share a transparent written quotation.",
    },
    {
      q: "What warranty and service do I get?",
      a: "You get full brand manufacturer warranty (1 to 2 years) plus our dedicated on-site technician visit support in Hubballi and Dharwad.",
    },
    {
      q: "Do you offer AMC & repair for existing systems?",
      a: "Yes! We service, repair, expand, and upgrade older CCTV setups even if they were installed by another vendor.",
    },
    {
      q: "How is installation scheduled and handled?",
      a: "Our certified technicians coordinate a convenient time slot with you, run clean concealed cabling, calibrate optimal camera angles, and configure the mobile app before handover.",
    },
  ];

  // Reviews dual-marquee rows
  const reviewsRowA = [
    { q: "Installed 4 cameras at our house. Neat concealed wiring and the app works seamlessly.", n: "Ramesh Kulkarni", p: "Dharwad", i: "R", bg: "#EAF3FD" },
    { q: "Very professional team. They recommended the exact right angles for our retail shop.", n: "Sunil Patil", p: "Hubballi", i: "S", bg: "#D6E8FB" },
    { q: "Night footage is remarkably clear. Got an alert the moment a delivery arrived at the gate.", n: "Anand Joshi", p: "Dharwad", i: "A", bg: "#EAF3FD" },
    { q: "Fair price and prompt service when one cable needed re-clamping. Highly recommended!", n: "Mahesh Desai", p: "Hubballi", i: "M", bg: "#D6E8FB" },
    { q: "Equipped our entire two-floor office with 8 cameras. Neat conduits, zero mess.", n: "Kiran Shettar", p: "Dharwad", i: "K", bg: "#EAF3FD" },
    { q: "Installed 4 cameras at our house. Neat concealed wiring and the app works seamlessly.", n: "Ramesh Kulkarni", p: "Dharwad", i: "R", bg: "#EAF3FD" },
  ];

  const reviewsRowB = [
    { q: "The video door phone is a lifesaver for my elderly parents. Crystal clear display.", n: "Vijay Belagavi", p: "Dharwad", i: "V", bg: "#D6E8FB" },
    { q: "They upgraded our old 720p setup to full HD without ripping out existing wiring. Saved tons.", n: "Prakash Hubli", p: "Hubballi", i: "P", bg: "#EAF3FD" },
    { q: "Wireless alarm system works flawlessly with the remote fobs. Very polite engineers.", n: "Naveen Hiremath", p: "Dharwad", i: "N", bg: "#D6E8FB" },
    { q: "I can check in on my billing counter from home anytime. Setup took less than an afternoon.", n: "Girish K.", p: "Hubballi", i: "G", bg: "#EAF3FD" },
    { q: "Best CCTV service in Dharwad. Genuine advice without pushing unnecessary add-ons.", n: "Deepak Shinde", p: "Dharwad", i: "D", bg: "#D6E8FB" },
    { q: "The video door phone is a lifesaver for my elderly parents. Crystal clear display.", n: "Vijay Belagavi", p: "Dharwad", i: "V", bg: "#D6E8FB" },
  ];

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    if (!leadPhone.trim()) return;
    const msg = `Hi Digitron Associates, I would like to request an installation quote for my property. My contact: +91 ${leadPhone}`;
    window.open(`https://wa.me/917975782567?text=${encodeURIComponent(msg)}`, "_blank");
    setLeadSubmitted(true);
  };

  const handleGetKit = (kit) => {
    const msg = `Hi Digitron Associates, I am interested in the ${kit.n}-Camera ${kit.label} Kit with Professional Site Installation. Please share quotation details.`;
    window.open(`https://wa.me/917975782567?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleQuickAdd = async (product, e) => {
    e?.stopPropagation();
    await addToCart(product.id, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  const toggleWishlist = (id, e) => {
    e?.stopPropagation();
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ background: "#FFFFFF", color: "#0B1F3A", overflowX: "hidden" }}>
      {/* =================================================================
          1. HERO SECTION
          ================================================================= */}
      <section id="top" className="hero-stage-section">
        <div className="hero-diagonal-stripe-1" />
        <div className="hero-diagonal-stripe-2" />

        <div className="hero-content-wrap">
          {/* Rating Badge */}
          <a href="#reviews" className="hero-rating-badge rise d1">
            <span className="hero-stars">★★★★★</span>
            <span>
              <strong>4.9</strong> rated · 250+ Google reviews · Hubballi–Dharwad
            </span>
          </a>

          {/* Large Display Title */}
          <h1 className="hero-h1-large h rise d2">
            See everything. <span>Worry about nothing.</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-sub-text rise d3">
            HD &amp; 4K CCTV cameras, complete kits and alarms — delivered, installed and set up on your phone by our local team.
          </p>

          {/* Action Buttons */}
          <div className="hero-cta-row rise d4">
            <a href="#kits" className="btn btn-hero-primary">
              Shop Camera Kits
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
            <a
              href="https://wa.me/917975782567?text=Hi Digitron, I would like to schedule a free site survey in Dharwad/Hubli."
              target="_blank"
              rel="noreferrer"
              className="btn btn-hero-white"
            >
              Free Site Survey
            </a>
          </div>

          {/* 4 Stats Highlights */}
          <div className="hero-stats-row rise d5">
            <div className="hero-stat-col">
              <span className="hero-stat-val h">4K</span>
              <span className="hero-stat-desc">Ultra HD options</span>
            </div>
            <div className="hero-stat-col">
              <span className="hero-stat-val h">24×7</span>
              <span className="hero-stat-desc">Recording</span>
            </div>
            <div className="hero-stat-col">
              <span className="hero-stat-val h">Expert</span>
              <span className="hero-stat-desc">Concealed Wiring</span>
            </div>
            <div className="hero-stat-col">
              <span className="hero-stat-val h">1 yr</span>
              <span className="hero-stat-desc">On-site Warranty</span>
            </div>
          </div>
        </div>

        {/* Floating Visual Stage */}
        <div className="hero-visual-stage reveal">
          <div className="hero-circle-stage" />
          <div className="hero-dashed-ring spin" />

          {/* Dome Camera Float */}
          <img
            src="/assets/cctv-dome.svg"
            alt="Turret dome CCTV camera"
            className="hero-cam-dome fl"
          />

          {/* Bullet Camera Float */}
          <img
            src="/assets/cctv-bullet.svg"
            alt="Bullet CCTV camera"
            className="hero-cam-bullet fl2"
          />

          {/* Wi-Fi Camera Float */}
          <img
            src="/assets/cctv-wifi.svg"
            alt="Wi-Fi 360 camera"
            className="hero-cam-wifi fl3"
          />

          {/* Rotating Circular Seal Badge */}
          <div className="hero-seal-badge pop">
            <svg className="spin" width="160" height="160" viewBox="0 0 170 170" style={{ position: "absolute", inset: 0 }}>
              <defs>
                <path id="hero-ring" d="M85 85m-66 0a66 66 0 1 1 132 0a66 66 0 1 1-132 0" />
              </defs>
              <circle cx="85" cy="85" r="84" fill="#080B10" />
              <text fontFamily="DM Sans, sans-serif" fontSize="13" fontWeight="700" letterSpacing="3" fill="#FFFFFF">
                <textPath href="#hero-ring">FREE INSTALLATION • FREE INSTALLATION • </textPath>
              </text>
            </svg>
            <div className="hero-seal-badge-inner" style={{ background: "#FFFFFF" }}>
              <span className="h" style={{ fontSize: 24, fontWeight: 800, color: "var(--brand)", lineHeight: 1 }}>
                BEST
              </span>
              <span style={{ fontSize: 10.5, fontWeight: 800, color: "#080B10", letterSpacing: "0.06em" }}>VALUE</span>
            </div>
          </div>

          {/* Floating Live Night Vision Radar Badge in sleek obsidian black */}
          <div className="hero-radar-badge pop fl3" style={{ background: "#080B10", border: "1px solid rgba(255, 255, 255, 0.16)", boxShadow: "0 12px 30px rgba(0, 0, 0, 0.35)" }}>
            <div className="radar-dot">
              <span className="ping" style={{ background: "#10B981" }} />
              <span className="radar-dot-core" style={{ background: "#10B981" }} />
            </div>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: "#FFFFFF" }}>Live · Full Color Night Vision</span>
          </div>
        </div>
      </section>

      {/* =================================================================
          2. FEATURE TICKER MARQUEE
          ================================================================= */}
      <section className="feature-ticker-section">
        <div className="marq">
          {[
            "4K ULTRA HD",
            "COLOUR NIGHT VISION",
            "MOBILE VIEWING",
            "MOTION ALERTS",
            "TWO-WAY AUDIO",
            "FREE INSTALLATION",
            "4K ULTRA HD",
            "COLOUR NIGHT VISION",
            "MOBILE VIEWING",
            "MOTION ALERTS",
            "TWO-WAY AUDIO",
            "FREE INSTALLATION",
          ].map((item, idx) => (
            <span key={idx} className="ticker-item h">
              <span>{item}</span>
              <svg className="ticker-sparkle" viewBox="0 0 24 24" fill="#7ABEFF">
                <path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" />
              </svg>
            </span>
          ))}
        </div>
      </section>

      {/* =================================================================
          3. SHOP BY CATEGORY (Sliding Window Type Loop)
          ================================================================= */}
      <section id="shop" className="category-section-wrap">
        <div className="section-head-split">
          <div>
            <span style={{ display: "inline-block", background: "#080B10", color: "#FFFFFF", padding: "5px 14px", borderRadius: "999px", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
              ALL-IN-ONE SURVEILLANCE CATALOG
            </span>
            <h2 className="section-h2-large h" style={{ marginTop: 4 }}>Shop by category</h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            {/* View Mode Toggle: Sliding Loop vs Grid */}
            <div style={{ display: "flex", background: "var(--color-ice)", borderRadius: 999, padding: 3, border: "1px solid var(--color-sky)" }}>
              <button
                type="button"
                onClick={() => setCategoryViewMode("sliding")}
                style={{
                  border: 0,
                  background: categoryViewMode === "sliding" ? "var(--brand)" : "transparent",
                  color: categoryViewMode === "sliding" ? "#FFFFFF" : "var(--color-slate-dark)",
                  fontSize: 12.5,
                  fontWeight: 700,
                  padding: "6px 14px",
                  borderRadius: 999,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                Sliding Loop
              </button>
              <button
                type="button"
                onClick={() => setCategoryViewMode("grid")}
                style={{
                  border: 0,
                  background: categoryViewMode === "grid" ? "var(--brand)" : "transparent",
                  color: categoryViewMode === "grid" ? "#FFFFFF" : "var(--color-slate-dark)",
                  fontSize: 12.5,
                  fontWeight: 700,
                  padding: "6px 14px",
                  borderRadius: 999,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                Grid View
              </button>
            </div>

            {categoryViewMode === "sliding" && (
              <div className="category-loop-controls">
                <button
                  type="button"
                  className={`category-ctrl-btn ${categoryDirection === "reverse" ? "active" : ""}`}
                  onClick={() => setCategoryDirection((prev) => (prev === "reverse" ? "normal" : "reverse"))}
                  title="Reverse direction"
                  aria-label="Reverse direction"
                >
                  <Icon name={categoryDirection === "reverse" ? "arrowRight" : "arrowLeft"} size={15} />
                </button>
                <button
                  type="button"
                  className={`category-ctrl-btn ${isCategoryPaused ? "active" : ""}`}
                  onClick={() => setIsCategoryPaused(!isCategoryPaused)}
                  title={isCategoryPaused ? "Resume auto-sliding" : "Pause sliding loop"}
                  aria-label={isCategoryPaused ? "Play" : "Pause"}
                >
                  <Icon name={isCategoryPaused ? "play" : "pause"} size={13} />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate("/category/cameras")}
              style={{ border: 0, background: "transparent", color: "var(--brand)", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              View all products →
            </button>
          </div>
        </div>

        {categoryViewMode === "sliding" ? (
          <div className="category-sliding-window" aria-label="Sliding category window loop">
            <div
              className={`category-sliding-track ${isCategoryPaused ? "paused" : ""} ${categoryDirection === "reverse" ? "reverse" : ""}`}
            >
              {/* Seamless infinite loop with duplicated categories array */}
              {[...categories, ...categories].map((c, idx) => (
                <div
                  key={`${c.slug}-${idx}`}
                  className="category-sliding-item"
                  onClick={() => navigate(`/category/${c.slug}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && navigate(`/category/${c.slug}`)}
                  title={`Browse ${c.name} (${c.count})`}
                >
                  <div className="category-sliding-circle" style={{ background: c.bg }}>
                    <img src={c.img} alt={c.name} className="category-sliding-img" loading="lazy" />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, textAlign: "center" }}>
                    <span className="category-sliding-title">{c.name}</span>
                    <span className="category-sliding-count">{c.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="category-grid-7 category-grid-full">
            {categories.map((c) => (
              <div
                key={c.name}
                className="category-avatar-card cat"
                onClick={() => navigate(`/category/${c.slug}`)}
              >
                <div className="category-avatar-circle" style={{ background: c.bg }}>
                  <img src={c.img} alt={c.name} className="category-avatar-img cimg" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, textAlign: "center" }}>
                  <span className="category-avatar-title">{c.name}</span>
                  <span className="category-avatar-count">{c.count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =================================================================
          4. BESTSELLERS THIS MONTH
          ================================================================= */}
      <section id="bestsellers" className="bestsellers-section-wrap">
        <div className="section-head-split">
          <div>
            <span style={{ fontSize: 14, fontWeight: 800, color: "var(--brand)", letterSpacing: "0.08em" }}>
              FLYING OFF THE SHELVES
            </span>
            <h2 className="section-h2-large h" style={{ marginTop: 6 }}>Bestsellers this month</h2>
          </div>

          <div className="bestsellers-filter-pills">
            {["All", "Home", "Shop", "Office"].map((tab) => (
              <button
                key={tab}
                type="button"
                className={`bestsellers-pill ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="bestsellers-cards-grid">
          {filteredProducts.map((p) => {
            const isWish = !!wishlist[p.id];
            const discountPct = Math.round(((p.mrp - p.price) / p.mrp) * 100);
            return (
              <article
                key={p.id}
                className="bestseller-card prod"
                onClick={() => navigate(`/product/${p.id}`)}
              >
                <div className="bestseller-img-stage" style={{ background: p.bg }}>
                  <img src={p.img} alt={p.name} className="bestseller-prod-img pimg" />
                  <span className="bestseller-badge-tag" style={{ background: p.tagBg }}>
                    {p.tag}
                  </span>
                  <button
                    type="button"
                    className="bestseller-wishlist-btn"
                    onClick={(e) => toggleWishlist(p.id, e)}
                    aria-label="Wishlist"
                  >
                    <Icon name="heart" size={18} color={isWish ? "#E5484D" : "#0B1F3A"} fill={isWish ? "#E5484D" : "none"} />
                  </button>
                  <button
                    type="button"
                    className="bestseller-quick-btn quick"
                    onClick={(e) => handleQuickAdd(p, e)}
                  >
                    {addedId === p.id ? "✓ Added to enquiry" : "Quick add to enquiry"}
                  </button>
                </div>

                <div className="bestseller-details">
                  <span style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, fontWeight: 600, color: "var(--color-slate)" }}>
                    <span style={{ color: "var(--brand)", letterSpacing: 1 }}>★★★★★</span>
                    ({p.rev})
                  </span>
                  <h3 className="bestseller-title h">{p.name}</h3>
                  <span className="bestseller-spec">{p.spec}</span>
                  <div className="bestseller-action-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 10 }}>
                    <span className="bestseller-quote-badge" style={{ fontSize: 12.5, fontWeight: 700, color: "#080B10", display: "inline-flex", alignItems: "center", gap: 6, background: "var(--color-ice)", padding: "5px 12px", borderRadius: 999 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--brand)" }}></span>
                      Quote on Request
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--brand)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      Details →
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* =================================================================
          5. FESTIVE OFFER BANNER WITH REAL-TIME COUNTDOWN
          ================================================================= */}
      <section id="kits" className="festive-deal-banner">
        <div style={{ position: "absolute", left: "-100px", top: "380px", width: "1700px", height: "140px", background: "#FFFFFF", opacity: 0.1, transform: "rotate(-8deg)" }} />
        <div style={{ position: "absolute", left: "-100px", top: "540px", width: "1700px", height: "40px", background: "#FFFFFF", opacity: 0.1, transform: "rotate(-8deg)" }} />

        <div className="festive-deal-content">
          <span className="festive-deal-tag">LIMITED-TIME FESTIVE DEAL</span>
          <h2 className="festive-deal-h2 h">Complete 4-camera home kit.</h2>
          <p style={{ margin: 0, fontSize: 19, lineHeight: 1.55, color: "#DDEBFC" }}>
            4 HD cameras + DVR recorder + hard disk + cabling + professional installation + mobile app setup. All-inclusive customized package.
          </p>

          <div className="festive-countdown-row">
            <div className="countdown-box">
              <span className="countdown-digit h">{hours}</span>
              <span className="countdown-label">HRS</span>
            </div>
            <div className="countdown-box">
              <span className="countdown-digit h">{mins}</span>
              <span className="countdown-label">MIN</span>
            </div>
            <div className="countdown-box">
              <span className="countdown-digit h">{seconds}</span>
              <span className="countdown-label">SEC</span>
            </div>
            <span style={{ fontSize: 14.5, fontWeight: 600, color: "#DDEBFC", paddingLeft: 8, lineHeight: 1.35 }}>
              left for<br />this offer
            </span>
          </div>

          <a href="#builder" className="btn btn-hero-white" style={{ alignSelf: "flex-start", height: 60, padding: "0 34px" }}>
            Grab the deal →
          </a>
        </div>

        {/* Floating Kit Equipment Mockup */}
        <div className="festive-deal-visuals">
          <img
            src="/assets/cctv-nvr.svg"
            alt="DVR recorder"
            className="fl2"
            style={{ position: "absolute", left: 160, top: 220, width: 340, height: 340 }}
          />
          <img
            src="/assets/cctv-dome.svg"
            alt="Dome camera"
            className="fl"
            style={{ position: "absolute", left: 20, top: 20, width: 250, height: 250 }}
          />
          <img
            src="/assets/cctv-dome.svg"
            alt="Dome camera"
            className="fl3"
            style={{ position: "absolute", left: 240, top: -10, width: 220, height: 220 }}
          />
          <img
            src="/assets/cctv-bullet.svg"
            alt="Bullet camera"
            className="fl"
            style={{ position: "absolute", left: 390, top: 90, width: 260, height: 260 }}
          />
          <img
            src="/assets/cctv-bullet.svg"
            alt="Bullet camera"
            className="fl2"
            style={{ position: "absolute", left: -40, top: 200, width: 240, height: 240 }}
          />
        </div>
      </section>

      {/* =================================================================
          6. VALUE PROPS ("Security made, like, ridiculously simple")
          ================================================================= */}
      <section className="value-props-section">
        <h2 className="section-h2-large h" style={{ maxWidth: 960 }}>
          Security made, like, <span style={{ color: "var(--brand)" }}>ridiculously simple.</span>
        </h2>

        <div className="value-props-grid">
          {/* Card 1: Night looks like day with live simulated CCTV feed */}
          <div className="vp-card vp">
            <div className="vp-stage-wrap">
              <div className="vimg feed" style={{ position: "absolute", inset: 0 }}>
                {/* 3D wireframe perspective room grid */}
                <svg width="100%" height="100%" viewBox="0 0 420 420" preserveAspectRatio="none" fill="none" stroke="#24406A">
                  <path d="M0 420L170 230M420 420L250 230M170 230H250M170 90V230M250 90V230M170 90H250M0 330L170 230M420 330L250 230" />
                </svg>
                {/* Moving CCTV laser scanline */}
                <div className="scanline" />
                {/* AI Person Detection bounding box */}
                <div style={{ position: "absolute", left: 175, top: 165, width: 70, height: 120, border: "2px solid #7ABEFF", borderRadius: 6 }} />
                <span style={{ position: "absolute", left: 175, top: 142, fontSize: 11, fontWeight: 700, color: "#7ABEFF" }}>
                  PERSON · 98%
                </span>
                <span style={{ position: "absolute", left: 20, top: 18, fontSize: 12, fontWeight: 700, color: "#CFE3FA" }}>
                  CAM 03 · 02:14 AM
                </span>
                <span className="blink" style={{ position: "absolute", right: 20, top: 18, fontSize: 12, fontWeight: 800, color: "#FF6B70" }}>
                  ● REC
                </span>
              </div>
            </div>
            <h3 className="h" style={{ margin: 0, fontSize: 30, fontWeight: 800 }}>Night looks like day</h3>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55, color: "var(--color-slate)" }}>
              Colour night vision and smart person detection, so footage is crisp and useful when it matters most.
            </p>
          </div>

          {/* Card 2: Watch from anywhere with smartphone mockup */}
          <div className="vp-card vp">
            <div className="vp-stage-wrap" style={{ background: "#D6E8FB", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div className="vimg" style={{ width: 210, height: 380, marginTop: 90, borderRadius: 38, background: "#0B1F3A", padding: 10 }}>
                <div style={{ height: "100%", borderRadius: 30, background: "#FFFFFF", overflow: "hidden", display: "flex", flexDirection: "column", gap: 8, padding: "26px 10px 10px" }}>
                  <span style={{ fontSize: 13, fontWeight: 800, paddingLeft: 4, color: "#0B1F3A" }}>My Home · 4 cams</span>
                  <div className="feed" style={{ position: "relative", height: 110, borderRadius: 14, overflow: "hidden" }}>
                    <div className="scanline" />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    <div className="feed" style={{ height: 60, borderRadius: 10 }} />
                    <div className="feed" style={{ height: 60, borderRadius: 10 }} />
                  </div>
                  <span style={{ padding: "8px 10px", borderRadius: 10, background: "#EAF3FD", fontSize: 11, fontWeight: 700, color: "#0B1F3A" }}>
                    Motion at gate · now
                  </span>
                </div>
              </div>
            </div>
            <h3 className="h" style={{ margin: 0, fontSize: 30, fontWeight: 800 }}>Watch from anywhere</h3>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55, color: "var(--color-slate)" }}>
              Live view, playback and instant alerts on your phone — we set up the app on all family phones before we leave.
            </p>
          </div>

          {/* Card 3: Certified Installation (Obsidian Black Accent Stage) */}
          <div className="vp-card vp">
            <div className="vp-stage-wrap" style={{ background: "#080B10", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src="/assets/cctv-ptz.svg" alt="PTZ speed dome" className="fl" style={{ width: 330, height: 330 }} />
              <span className="h" style={{ position: "absolute", left: 26, bottom: 22, fontSize: 56, fontWeight: 800, color: "#FFFFFF", lineHeight: 1 }}>
                Clean.
              </span>
            </div>
            <h3 className="h" style={{ margin: 0, fontSize: 30, fontWeight: 800 }}>Certified Installation</h3>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55, color: "var(--color-slate)" }}>
              Neat concealed cabling, verified camera angles and complete walkthrough — carried out cleanly by certified local technicians.
            </p>
          </div>
        </div>
      </section>

      {/* =================================================================
          7. SPEC HOTSPOTS ("Built for Indian conditions")
          ================================================================= */}
      <section className="spec-hotspots-section">
        <div style={{ maxWidth: 580, display: "flex", flexDirection: "column", gap: 14 }}>
          <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.1em", color: "var(--color-glow)" }}>
            BUILT FOR INDIAN CONDITIONS
          </span>
          <h2 className="section-h2-large h" style={{ color: "#FFFFFF" }}>Engineered to never blink.</h2>
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.55, color: "#B7CBE4" }}>
            Dust, summer heat, voltage fluctuations, and heavy monsoon rain — the equipment we install is rated for all of it.
          </p>
        </div>

        {/* Central Bullet Graphic with radar pins */}
        <div className="hotspots-diagram-stage">
          <div className="hotspots-circle-bg" />
          <img
            src="/assets/cctv-bullet.svg"
            alt="Bullet camera model"
            className="fl hotspots-bullet-img"
          />

          <div className="hotspots-items-container">
            {/* Hotspot 1 */}
            <div className="hotspot-item hotspot-item-1">
              <div className="hotspot-pin">
                <span className="ping" style={{ background: "#7ABEFF" }} />
                <div className="hotspot-pin-core" />
              </div>
              <div>
                <span className="h hotspot-title">Smart IR LEDs</span>
                <span className="hotspot-desc">30m clear night range</span>
              </div>
            </div>

            {/* Hotspot 2 */}
            <div className="hotspot-item hotspot-item-2">
              <div className="hotspot-pin">
                <span className="ping" style={{ background: "#7ABEFF" }} />
                <div className="hotspot-pin-core" />
              </div>
              <div>
                <span className="h hotspot-title">4K Sensor</span>
                <span className="hotspot-desc">Sharp detail, readable vehicle plates</span>
              </div>
            </div>

            {/* Hotspot 3 */}
            <div className="hotspot-item hotspot-item-3">
              <div className="hotspot-pin">
                <span className="ping" style={{ background: "#7ABEFF" }} />
                <div className="hotspot-pin-core" />
              </div>
              <div>
                <span className="h hotspot-title">IP67 Housing</span>
                <span className="hotspot-desc">Rain, dust, corrosion & heat proof</span>
              </div>
            </div>

            {/* Hotspot 4 */}
            <div className="hotspot-item hotspot-item-4">
              <div className="hotspot-pin">
                <span className="ping" style={{ background: "#7ABEFF" }} />
                <div className="hotspot-pin-core" />
              </div>
              <div>
                <span className="h hotspot-title">Metal Bracket</span>
                <span className="hotspot-desc">Tamper-resistant reinforced mount</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hotspots-stats-row">
          <div>
            <span className="h" style={{ fontSize: 52, fontWeight: 800, color: "var(--color-glow)" }}>IP67</span>
            <span style={{ display: "block", fontSize: 14, color: "#B7CBE4" }}>Weatherproof Certified</span>
          </div>
          <div>
            <span className="h" style={{ fontSize: 52, fontWeight: 800, color: "var(--color-glow)" }}>30m</span>
            <span style={{ display: "block", fontSize: 14, color: "#B7CBE4" }}>Night Vision Range</span>
          </div>
        </div>
      </section>

      {/* =================================================================
          8. INTERACTIVE KIT BUILDER
          ================================================================= */}
      <section id="builder" className="kit-builder-section">
        {/* Dynamic Kit Preview Stage */}
        <div className="kit-builder-visual">
          <div
            style={{
              position: "absolute",
              width: 380,
              height: 380,
              borderRadius: "50%",
              background: "var(--color-sky)",
            }}
          />
          <img
            src="/assets/cctv-nvr.svg"
            alt="Recorder"
            className="fl2"
            style={{ position: "absolute", left: 120, top: 240, width: 280, height: 280 }}
          />
          <img
            src="/assets/cctv-dome.svg"
            alt="Dome camera"
            className="fl"
            style={{ position: "absolute", left: 40, top: 40, width: 220, height: 220 }}
          />
          <img
            src="/assets/cctv-bullet.svg"
            alt="Bullet camera"
            className="fl3"
            style={{ position: "absolute", right: 40, top: 30, width: 250, height: 250 }}
          />
          <span
            className="h"
            style={{
              position: "absolute",
              right: 24,
              bottom: 24,
              padding: "10px 20px",
              borderRadius: 999,
              background: "var(--brand)",
              color: "#FFFFFF",
              fontSize: 20,
              fontWeight: 800,
            }}
          >
            ×{currentKit.n} cameras
          </span>
        </div>

        {/* Configuration Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 15, fontWeight: 600 }}>
            <span style={{ color: "var(--brand)", letterSpacing: 1 }}>★★★★★</span>
            4.9 · 100+ kits installed in Dharwad
          </span>
          <h2 className="section-h2-large h" style={{ margin: 0 }}>Build your camera kit</h2>
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.55, color: "var(--color-slate)" }}>
            Pick how many cameras you need. Everything else — recorder, storage, cabling and installation — is included.
          </p>

          <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.06em", color: "var(--color-navy)" }}>
            HOW MANY CAMERAS?
          </span>

          <div className="kit-selector-buttons">
            {kitDefs.map((k, idx) => {
              const isSelected = kitIndex === idx;
              return (
                <button
                  key={k.n}
                  type="button"
                  className="kit-pick-btn"
                  onClick={() => setKitIndex(idx)}
                  style={{
                    background: isSelected ? "var(--brand)" : "#FFFFFF",
                    color: isSelected ? "#FFFFFF" : "var(--color-navy)",
                  }}
                >
                  <span className="h" style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>{k.n}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700 }}>{k.label}</span>
                  {k.popular && (
                    <span className="kit-popular-tag">MOST POPULAR</span>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "8px 0" }}>
            {kitIncludes.map((inc, i) => (
              <span key={i} style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 15.5, fontWeight: 500 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--brand)" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="11" />
                  <path d="M7 12.5l3.2 3.2L17 9" stroke="#FFFFFF" strokeWidth="2.4" fill="none" />
                </svg>
                {inc}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              type="button"
              className="btn kit-quotation-cta-btn"
              onClick={() => handleGetKit(currentKit)}
            >
              <span className="kit-quotation-cta-main">Request Kit Quotation</span>
              <span className="kit-quotation-cta-sub">
                Free Site Survey Included →
              </span>
            </button>
          </div>
          <span style={{ fontSize: 13.5, color: "var(--color-slate)", fontWeight: 500 }}>
            Free site survey · Pay after installation · 1-year on-site warranty
          </span>
        </div>
      </section>

      {/* =================================================================
          9. CLIENTS & REVIEWS SECTION
          ================================================================= */}
      <section id="reviews" className="reviews-section-wrap">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center", padding: "0 24px" }}>
          <span style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 16, fontWeight: 700 }}>
            <span style={{ color: "var(--brand)", fontSize: 20, letterSpacing: 2 }}>★★★★★</span>
            4.9 from 250+ Google reviews
          </span>
          <h2 className="section-h2-large h">
            Dharwad’s <span style={{ color: "var(--brand)" }}>watching</span> — happily.
          </h2>
        </div>

        {/* Client names marquee */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <span style={{ textAlign: "center", fontSize: 13, fontWeight: 800, letterSpacing: "0.14em", color: "var(--color-slate)" }}>
            BUSINESSES THAT TRUST US
          </span>
          <div className="marq-slow" style={{ gap: 72, paddingLeft: 72, whiteSpace: "nowrap" }}>
            {[
              "MUTHOOT FINANCE",
              "RELIANCE SMART",
              "ROYAL OAK DHARWAD",
              "KLE TECH CAMPUS",
              "HOTEL METROPOLIS",
              "HERO MOTOCORP",
              "MUTHOOT FINANCE",
              "RELIANCE SMART",
              "ROYAL OAK DHARWAD",
              "KLE TECH CAMPUS",
            ].map((cl, i) => (
              <span key={i} className="h" style={{ fontSize: 28, fontWeight: 800, color: "#9DB2CC" }}>
                {cl}
              </span>
            ))}
          </div>
        </div>

        {/* Dual Scrolling Review Rows */}
        <div className="marq-slow" style={{ gap: 20, paddingLeft: 20 }}>
          {reviewsRowA.map((r, i) => (
            <figure key={i} className="review-card-item" style={{ background: r.bg }}>
              <span style={{ color: "var(--brand)", fontSize: 18, letterSpacing: 2 }}>★★★★★</span>
              <blockquote style={{ margin: 0, fontSize: 17, lineHeight: 1.5, fontWeight: 500, color: "var(--color-navy)" }}>
                “{r.q}”
              </blockquote>
              <figcaption style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="review-author-avatar">{r.i}</span>
                <span style={{ display: "flex", flexDirection: "column" }}>
                  <strong style={{ fontSize: 15, fontWeight: 700, color: "var(--color-navy)" }}>{r.n}</strong>
                  <small style={{ fontSize: 12.5, color: "var(--color-slate)" }}>{r.p} · Verified Google review</small>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="marq-rev" style={{ gap: 20, paddingLeft: 20 }}>
          {reviewsRowB.map((r, i) => (
            <figure key={i} className="review-card-item" style={{ background: r.bg }}>
              <span style={{ color: "var(--brand)", fontSize: 18, letterSpacing: 2 }}>★★★★★</span>
              <blockquote style={{ margin: 0, fontSize: 17, lineHeight: 1.5, fontWeight: 500, color: "var(--color-navy)" }}>
                “{r.q}”
              </blockquote>
              <figcaption style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="review-author-avatar" style={{ background: "var(--color-navy)" }}>{r.i}</span>
                <span style={{ display: "flex", flexDirection: "column" }}>
                  <strong style={{ fontSize: 15, fontWeight: 700, color: "var(--color-navy)" }}>{r.n}</strong>
                  <small style={{ fontSize: 12.5, color: "var(--color-slate)" }}>{r.p} · Verified Google review</small>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* =================================================================
          10. FAQ ACCORDION SECTION
          ================================================================= */}
      <section id="faq" className="faq-section-wrap">
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <h2 className="section-h2-large h">Questions? We’ve got answers.</h2>
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.55, color: "var(--color-slate)" }}>
            Still unsure what setup is best? Send us a quick photo or floorplan of your space on WhatsApp and we’ll recommend the exact setup.
          </p>
          <a
            href="https://wa.me/917975782567?text=Hi Digitron, I have a few questions regarding CCTV installation."
            target="_blank"
            rel="noreferrer"
            className="btn"
            style={{
              alignSelf: "flex-start",
              height: 56,
              padding: "0 28px",
              borderRadius: 999,
              background: "var(--color-navy)",
              color: "#FFFFFF",
              fontSize: 16,
              fontWeight: 700,
              gap: 8,
              textDecoration: "none",
            }}
          >
            Chat on WhatsApp
          </a>
          <img
            src="/assets/cctv-alarm.svg"
            alt="Alarm hardware"
            className="fl"
            style={{ width: 260, height: 260, marginTop: 20 }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {faqs.map((f, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={i} className="faq-row">
                <button
                  type="button"
                  className="faq-toggle-btn"
                  onClick={() => setOpenFaq(isOpen ? -1 : i)}
                >
                  <span className="h" style={{ fontSize: 22, fontWeight: 700, color: "var(--color-navy)" }}>
                    {f.q}
                  </span>
                  <span
                    className="faq-icon-bubble"
                    style={{
                      background: isOpen ? "var(--brand)" : "var(--color-ice)",
                      color: isOpen ? "#FFFFFF" : "var(--color-navy)",
                    }}
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <p style={{ margin: "14px 0 0", fontSize: 16.5, lineHeight: 1.6, color: "var(--color-slate)", maxWidth: 580 }}>
                    {f.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =================================================================
          11. FINAL LEAD / CONVERSION CARD
          ================================================================= */}
      <section className="lead-cta-card">
        <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 20, zIndex: 5 }}>
          <h2 className="section-h2-large h" style={{ color: "#FFFFFF", lineHeight: 0.95 }}>
            Get ₹500 off your first install.
          </h2>
          <p style={{ margin: 0, fontSize: 19, lineHeight: 1.5, color: "#DDEBFC" }}>
            Drop your WhatsApp number — we’ll send the discount voucher and schedule your free site survey slot.
          </p>

          <form onSubmit={handleLeadSubmit} className="lead-cta-form">
            <label style={{ display: "flex", alignItems: "center", gap: 6, flexGrow: 1, color: "var(--color-navy)", fontWeight: 700, fontSize: 16 }}>
              +91
              <input
                type="tel"
                value={leadPhone}
                onChange={(e) => setLeadPhone(e.target.value)}
                placeholder="WhatsApp number"
                className="lead-cta-input"
                maxLength={10}
              />
            </label>
            <button
              type="submit"
              className="btn"
              style={{
                height: 52,
                padding: "0 28px",
                borderRadius: 999,
                background: "var(--color-navy)",
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: 800,
                border: 0,
              }}
            >
              {leadSubmitted ? "Sent! Check WhatsApp" : "Claim offer"}
            </button>
          </form>
          <span style={{ fontSize: 13.5, color: "#DDEBFC" }}>
            No spam. Just the offer voucher and survey confirmation.
          </span>
        </div>

        {/* Decorative Floating Models */}
        <img
          src="/assets/cctv-door.svg"
          alt="Video door phone"
          className="fl"
          style={{ position: "absolute", right: 180, top: 40, width: 340, height: 340, opacity: 0.9 }}
        />
        <img
          src="/assets/cctv-wifi.svg"
          alt="Wi-Fi camera"
          className="fl2"
          style={{ position: "absolute", right: 20, top: 220, width: 220, height: 220, opacity: 0.9 }}
        />
      </section>

      {/* =================================================================
          12. FOOTER
          ================================================================= */}
      <Footer />
    </div>
  );
}
