import siteConfig from "../../data/siteConfig";

export default function FloatingWhatsApp() {
  const waNumber = siteConfig.whatsappNumber || "917975782567";
  return (
    <a
      href={`https://wa.me/${waNumber}?text=Hi Digitron Associates, I would like to enquire about CCTV cameras and installation.`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      style={{
        position: "fixed",
        right: "32px",
        bottom: "32px",
        zIndex: 999,
        width: "62px",
        height: "62px",
        display: "block",
        cursor: "pointer",
        textDecoration: "none",
      }}
    >
      <span className="ping" style={{ background: "#25D366" }}></span>
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "#25D366",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 16px 30px -10px rgba(0,0,0,0.35)",
          transition: "transform 0.25s cubic-bezier(0.16, 0.84, 0.3, 1)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
          <path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"></path>
          <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2z"></path>
        </svg>
      </span>
    </a>
  );
}
